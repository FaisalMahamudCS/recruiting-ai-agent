const express = require("express");
const { getTaskStatus } = require("../controllers/taskController");

const router = express.Router();

router.get("/:taskId", getTaskStatus);

module.exports = router;
