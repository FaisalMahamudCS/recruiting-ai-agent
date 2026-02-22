const Task = require("../../../api/src/models/Task");
const Candidate = require("../../../api/src/models/Candidate");
const Message = require("../../../api/src/models/Message");
const { generateOutreachMessage } = require("../../../api/src/services/outreachService");
const { redisDel } = require("../../../api/src/config/redis");

async function processOutreachJob(job) {
  const { taskId, candidateId, jobId } = job.data;

  console.log(`[worker:outreach] started task=${taskId}`);
  await Task.findOneAndUpdate(
    { taskId },
    { status: "processing", attempts: job.attemptsMade + 1 },
    { new: true }
  );

  try {
    const content = await generateOutreachMessage(candidateId, jobId);
    const message = await Message.create({
      candidateId,
      jobId,
      content,
      status: "pending",
      attempts: job.attemptsMade + 1
    });

    console.log(`[worker:outreach] sending message=${message._id} candidate=${candidateId}`);

    await Message.findByIdAndUpdate(message._id, {
      status: "sent",
      sentAt: new Date(),
      attempts: job.attemptsMade + 1
    });

    await Candidate.findByIdAndUpdate(candidateId, { status: "outreached" });
    await redisDel(`candidates:${jobId}`);

    const result = {
      messageId: message._id,
      status: "sent"
    };

    await Task.findOneAndUpdate(
      { taskId },
      { status: "completed", result, error: null, attempts: job.attemptsMade + 1 },
      { new: true }
    );

    console.log(`[worker:outreach] completed task=${taskId}`);
    return result;
  } catch (error) {
    await Task.findOneAndUpdate(
      { taskId },
      { status: "failed", error: error.message, attempts: job.attemptsMade + 1 },
      { new: true }
    );
    console.error(`[worker:outreach] failed task=${taskId}:`, error.message);
    throw error;
  }
}

module.exports = { processOutreachJob };
