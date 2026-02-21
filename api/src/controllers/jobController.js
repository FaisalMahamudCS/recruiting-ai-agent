const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const Task = require("../models/Task");
const { sourcingQueue } = require("../queues/queueManager");
const { redisGet, redisSet } = require("../config/redis");

function errorResponse(res, error, code, status = 500) {
  return res.status(status).json({
    success: false,
    error: error.message || "Internal server error",
    ...(code ? { code } : {})
  });
}

async function createJob(req, res) {
  try {
    const job = await Job.create(req.body);
    return res.status(201).json({ success: true, data: job });
  } catch (error) {
    return errorResponse(res, error, "JOB_CREATE_FAILED", 400);
  }
}

async function listJobs(req, res) {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: jobs, total: jobs.length, page: 1 });
  } catch (error) {
    return errorResponse(res, error, "JOB_LIST_FAILED");
  }
}

async function getJobById(req, res) {
  try {
    const { id } = req.params;
    const cacheKey = `job:${id}`;
    const cached = await redisGet(cacheKey);
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached) });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found", code: "JOB_NOT_FOUND" });
    }

    await redisSet(cacheKey, JSON.stringify(job), 3600);
    return res.json({ success: true, data: job });
  } catch (error) {
    return errorResponse(res, error, "JOB_FETCH_FAILED");
  }
}

async function getJobCandidates(req, res) {
  try {
    const { jobId } = req.params;
    const cacheKey = `candidates:${jobId}`;
    const cached = await redisGet(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      return res.json({ success: true, data, total: data.length, page: 1 });
    }

    const candidates = await Candidate.find({ jobId }).sort({ createdAt: -1 });
    await redisSet(cacheKey, JSON.stringify(candidates), 300);
    return res.json({ success: true, data: candidates, total: candidates.length, page: 1 });
  } catch (error) {
    return errorResponse(res, error, "CANDIDATE_LIST_FAILED");
  }
}

async function createSourcingTask(req, res) {
  try {
    const { jobId } = req.params;
    const { query, limit = 10 } = req.body || {};

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found", code: "JOB_NOT_FOUND" });
    }

    const task = new Task({
      type: "sourcing",
      jobId,
      status: "queued"
    });
    task.taskId = `task_${task._id}`;
    await task.save();

    await sourcingQueue.add("source-candidates", {
      taskId: task.taskId,
      taskMongoId: task._id.toString(),
      jobId,
      query,
      limit
    });

    return res.status(201).json({
      success: true,
      data: { taskId: task.taskId, status: "queued" }
    });
  } catch (error) {
    return errorResponse(res, error, "SOURCING_TASK_CREATE_FAILED");
  }
}

module.exports = {
  createJob,
  listJobs,
  getJobById,
  getJobCandidates,
  createSourcingTask
};
