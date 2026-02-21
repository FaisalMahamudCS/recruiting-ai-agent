const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskId: { type: String, unique: true, required: true, index: true },
    type: { type: String, enum: ["sourcing", "scoring", "outreach", "response"], required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
    status: { type: String, enum: ["queued", "processing", "completed", "failed"], default: "queued" },
    result: { type: mongoose.Schema.Types.Mixed },
    error: { type: String },
    attempts: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
