const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requirements: [{ type: String }],
    location: { type: String, trim: true },
    type: { type: String, enum: ["remote", "onsite", "hybrid"] },
    status: { type: String, enum: ["active", "closed", "draft"], default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
