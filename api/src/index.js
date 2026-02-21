const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { initRedis } = require("./config/redis");

const jobRoutes = require("./routes/jobs");
const candidateRoutes = require("./routes/candidates");
const taskRoutes = require("./routes/tasks");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/tasks", taskRoutes);

app.use((err, _req, res, _next) => {
  console.error("[api] unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error", code: "UNHANDLED_ERROR" });
});

const port = Number(process.env.PORT || 3000);

async function start() {
  await connectDB();
  initRedis();

  app.listen(port, () => {
    console.log(`[api] listening on port ${port}`);
  });
}

start();
