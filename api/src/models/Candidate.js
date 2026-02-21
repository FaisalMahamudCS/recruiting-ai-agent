const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    linkedinUrl: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    currentTitle: { type: String, trim: true },
    currentCompany: { type: String, trim: true },
    skills: [{ type: String }],
    experience: { type: Number },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    sourcedFrom: { type: String, trim: true },
    aiScore: {
      score: { type: Number, min: 0, max: 100 },
      reasoning: { type: String },
      scoredAt: { type: Date }
    },
    status: {
      type: String,
      enum: ["sourced", "scored", "outreached", "responded", "interested", "not_interested"],
      default: "sourced"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);
