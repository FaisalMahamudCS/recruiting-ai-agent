const Task = require("../../../api/src/models/Task");
const Candidate = require("../../../api/src/models/Candidate");
const { sourceCandidatesForJob } = require("../../../api/src/services/sourcingService");
const { redisDel } = require("../../../api/src/config/redis");

async function processSourcingJob(job) {
  const { taskId, jobId, query, limit = 10 } = job.data;

  console.log(`[worker:sourcing] started task=${taskId}`);
  await Task.findOneAndUpdate(
    { taskId },
    { status: "processing", attempts: job.attemptsMade + 1 },
    { new: true }
  );

  try {
    const candidates = await sourceCandidatesForJob(jobId, query, limit);
    let upsertedCount = 0;

    for (const candidate of candidates) {
      const updated = await Candidate.findOneAndUpdate(
        { linkedinUrl: candidate.linkedinUrl },
        {
          $set: {
            name: candidate.name,
            linkedinUrl: candidate.linkedinUrl,
            currentTitle: candidate.currentTitle,
            currentCompany: candidate.currentCompany,
            skills: candidate.skills || [],
            sourcedFrom: candidate.sourcedFrom || "serper",
            status: "sourced",
            jobId
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (updated) upsertedCount += 1;
    }

    await redisDel(`candidates:${jobId}`);

    const result = {
      candidatesFound: candidates.length,
      candidatesUpserted: upsertedCount
    };

    await Task.findOneAndUpdate(
      { taskId },
      { status: "completed", result, error: null, attempts: job.attemptsMade + 1 },
      { new: true }
    );

    console.log(`[worker:sourcing] completed task=${taskId}`);
    return result;
  } catch (error) {
    await Task.findOneAndUpdate(
      { taskId },
      { status: "failed", error: error.message, attempts: job.attemptsMade + 1 },
      { new: true }
    );
    console.error(`[worker:sourcing] failed task=${taskId}:`, error.message);
    throw error;
  }
}

module.exports = { processSourcingJob };
