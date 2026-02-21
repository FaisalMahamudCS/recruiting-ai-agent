const Task = require("../models/Task");

async function getTaskStatus(req, res) {
  try {
    const { taskId } = req.params;
    const task = await Task.findOne({ taskId });
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found", code: "TASK_NOT_FOUND" });
    }

    return res.json({
      success: true,
      data: {
        taskId: task.taskId,
        type: task.type,
        status: task.status,
        result: task.result,
        error: task.error,
        attempts: task.attempts,
        updatedAt: task.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
      code: "TASK_FETCH_FAILED"
    });
  }
}

module.exports = { getTaskStatus };
