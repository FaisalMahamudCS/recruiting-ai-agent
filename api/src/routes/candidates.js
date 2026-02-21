const express = require("express");
const {
  queueCandidateScoring,
  queueCandidateOutreach,
  handleCandidateResponse
} = require("../controllers/candidateController");

const router = express.Router();

router.post("/:id/scores", queueCandidateScoring);
router.post("/:id/outreach", queueCandidateOutreach);
router.post("/:id/responses", handleCandidateResponse);

module.exports = router;
