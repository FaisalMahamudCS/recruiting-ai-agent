const { Queue } = require("bullmq");
const { createBullConnection } = require("../config/redis");

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 2000 }
};

const connection = createBullConnection();

const sourcingQueue = new Queue("sourcing-queue", { connection, defaultJobOptions });
const scoringQueue = new Queue("scoring-queue", { connection, defaultJobOptions });
const outreachQueue = new Queue("outreach-queue", { connection, defaultJobOptions });
const responseQueue = new Queue("response-queue", { connection, defaultJobOptions });

module.exports = {
  connection,
  defaultJobOptions,
  sourcingQueue,
  scoringQueue,
  outreachQueue,
  responseQueue
};
