const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const { Worker } = require("bullmq");
const { connectDB } = require("../../api/src/config/db");
const { initRedis } = require("../../api/src/config/redis");
const { connection } = require("../../api/src/queues/queueManager");

const { processSourcingJob } = require("./processors/sourcingProcessor");
const { processScoringJob } = require("./processors/scoringProcessor");
const { processOutreachJob } = require("./processors/outreachProcessor");
const { processResponseJob } = require("./processors/responseProcessor");

function registerWorker(queueName, processor) {
  const worker = new Worker(queueName, processor, { connection });

  worker.on("completed", (job) => {
    console.log(`[worker] ${queueName} completed job=${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[worker] ${queueName} failed job=${job?.id}:`, err.message);
  });

  worker.on("error", (err) => {
    console.error(`[worker] ${queueName} worker error:`, err.message);
  });

  return worker;
}

async function startWorker() {
  await connectDB();
  initRedis();

  registerWorker("sourcing-queue", processSourcingJob);
  registerWorker("scoring-queue", processScoringJob);
  registerWorker("outreach-queue", processOutreachJob);
  registerWorker("response-queue", processResponseJob);

  console.log("[worker] all queue workers started");
}

startWorker().catch((error) => {
  console.error("[worker] failed to start:", error.message);
  process.exit(1);
});
