const Task = require("../../../api/src/models/Task");
const Candidate = require("../../../api/src/models/Candidate");
const { classifyIntent } = require("../../../api/src/services/responseService");
const { redisDel } = require("../../../api/src/config/redis");

async function processResponseJob(job) {
  const { taskId, candidateId, message } = job.data;

  console.log(`[worker:response] started task=${taskId}`);
  await Task.findOneAndUpdate(
    { taskId },
    { status: "processing", attempts: job.attemptsMade + 1 },
    { new: true }
  );

  try {
    const classification = await classifyIntent(message);

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { status: classification.intent },
      { new: true }
    );

    if (updatedCandidate && updatedCandidate.jobId) {
      await redisDel(`candidates:${updatedCandidate.jobId}`);
    }

    const result = {
      intent: classification.intent,
      schedulingLink: classification.schedulingLink,
      reply: classification.reply
    };

    await Task.findOneAndUpdate(
      { taskId },
      { status: "completed", result, error: null, attempts: job.attemptsMade + 1 },
      { new: true }
    );

    console.log(`[worker:response] completed task=${taskId}`);
    return result;
  } catch (error) {
    await Task.findOneAndUpdate(
      { taskId },
      { status: "failed", error: error.message, attempts: job.attemptsMade + 1 },
      { new: true }
    );
    console.error(`[worker:response] failed task=${taskId}:`, error.message);
    throw error;
  }
}

module.exports = { processResponseJob };
