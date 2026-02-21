const Candidate = require("../models/Candidate");
const Task = require("../models/Task");
const { scoringQueue, outreachQueue, responseQueue } = require("../queues/queueManager");

function errorResponse(res, error, code, status = 500) {
  return res.status(status).json({
    success: false,
    error: error.message || "Internal server error",
    ...(code ? { code } : {})
  });
}

async function queueCandidateScoring(req, res) {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ success: false, error: "Candidate not found", code: "CANDIDATE_NOT_FOUND" });
    }

    const task = new Task({
      type: "scoring",
      jobId: candidate.jobId,
      candidateId: candidate._id,
      status: "queued"
    });
    task.taskId = `task_${task._id}`;
    await task.save();

    await scoringQueue.add("score-candidate", {
      taskId: task.taskId,
      taskMongoId: task._id.toString(),
      candidateId: candidate._id.toString(),
      jobId: candidate.jobId.toString()
    });

    return res.status(201).json({ success: true, data: { taskId: task.taskId, status: "queued" } });
  } catch (error) {
    return errorResponse(res, error, "SCORING_TASK_CREATE_FAILED");
  }
}

async function queueCandidateOutreach(req, res) {
  try {
    const { id } = req.params;
    const { jobId } = req.body || {};

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ success: false, error: "Candidate not found", code: "CANDIDATE_NOT_FOUND" });
    }

    const resolvedJobId = jobId || candidate.jobId;
    const task = new Task({
      type: "outreach",
      jobId: resolvedJobId,
      candidateId: candidate._id,
      status: "queued"
    });
    task.taskId = `task_${task._id}`;
    await task.save();

    await outreachQueue.add("outreach-candidate", {
      taskId: task.taskId,
      taskMongoId: task._id.toString(),
      candidateId: candidate._id.toString(),
      jobId: resolvedJobId.toString()
    });

    return res.status(201).json({ success: true, data: { taskId: task.taskId, status: "queued" } });
  } catch (error) {
    return errorResponse(res, error, "OUTREACH_TASK_CREATE_FAILED");
  }
}

async function handleCandidateResponse(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ success: false, error: "message is required", code: "INVALID_PAYLOAD" });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ success: false, error: "Candidate not found", code: "CANDIDATE_NOT_FOUND" });
    }

    const task = new Task({
      type: "response",
      jobId: candidate.jobId,
      candidateId: candidate._id,
      status: "queued"
    });
    task.taskId = `task_${task._id}`;
    await task.save();

    await responseQueue.add("candidate-response", {
      taskId: task.taskId,
      taskMongoId: task._id.toString(),
      candidateId: candidate._id.toString(),
      jobId: candidate.jobId.toString(),
      message
    });

    return res.status(201).json({ success: true, data: { taskId: task.taskId, status: "queued" } });
  } catch (error) {
    return errorResponse(res, error, "RESPONSE_TASK_CREATE_FAILED");
  }
}

module.exports = {
  queueCandidateScoring,
  queueCandidateOutreach,
  handleCandidateResponse
};
