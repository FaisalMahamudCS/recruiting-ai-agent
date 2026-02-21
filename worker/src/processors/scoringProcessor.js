const Task = require("../../../api/src/models/Task");
const { scoreCandidate } = require("../../../api/src/services/scoringService");

async function processScoringJob(job) {
  const { taskId, candidateId, jobId } = job.data;

  console.log(`[worker:scoring] started task=${taskId}`);
  await Task.findOneAndUpdate(
    { taskId },
    { status: "processing", attempts: job.attemptsMade + 1 },
    { new: true }
  );

  try {
    const result = await scoreCandidate(candidateId, jobId);

    await Task.findOneAndUpdate(
      { taskId },
      { status: "completed", result, error: null, attempts: job.attemptsMade + 1 },
      { new: true }
    );

    console.log(`[worker:scoring] completed task=${taskId}`);
    return result;
  } catch (error) {
    await Task.findOneAndUpdate(
      { taskId },
      { status: "failed", error: error.message, attempts: job.attemptsMade + 1 },
      { new: true }
    );
    console.error(`[worker:scoring] failed task=${taskId}:`, error.message);
    throw error;
  }
}

module.exports = { processScoringJob };
