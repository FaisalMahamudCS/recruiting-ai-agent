const Job = require("../models/Job");
const SerperProvider = require("../providers/SerperProvider");

const provider = new SerperProvider();

async function sourceCandidatesForJob(jobId, query, limit = 10) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  const fallbackQuery = `${job.title} developer LinkedIn profile`;
  const searchQuery = query || fallbackQuery;

  return provider.searchCandidates(searchQuery, limit);
}

module.exports = { sourceCandidatesForJob };
