const express = require("express");
const {
  createJob,
  listJobs,
  getJobById,
  getJobCandidates,
  createSourcingTask
} = require("../controllers/jobController");

const router = express.Router();

router.post("/", createJob);
router.get("/", listJobs);
router.get("/:id", getJobById);
router.get("/:jobId/candidates", getJobCandidates);
router.post("/:jobId/sourcing-tasks", createSourcingTask);

module.exports = router;
