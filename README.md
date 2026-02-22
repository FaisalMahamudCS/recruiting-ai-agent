# Recruiting Automation System

End-to-end MERN-style recruiting automation platform with:
- Express API for job, candidate, and task orchestration
- BullMQ queue pipeline for async sourcing/scoring/outreach/response flows
- MongoDB for persistence
- Redis for queue backend + caching
- Gemini (via LangChain) for AI scoring, outreach generation, and response intent classification
- Serper API for sourcing LinkedIn-style candidate leads
- Next.js frontend (React + Tailwind + TanStack Query) for job/candidate workflows

## Architecture Overview

Three independent Node processes:
- `api/`: receives HTTP requests, creates `Task` records, enqueues BullMQ jobs, and serves task/job/candidate status.
- `worker/`: consumes BullMQ queues and performs heavy async operations (sourcing, AI scoring, outreach, intent classification).
- `frontend/`: Next.js web UI running locally on port `5173`.

Data flow:
1. API endpoint creates a `Task` with `status=queued`.
2. API enqueues job into one of four queues.
3. Worker picks job, sets task to `processing`.
4. Worker executes processor logic.
5. Worker updates task to `completed` or `failed`.

## Setup

### 1) Start infrastructure (MongoDB + Redis)

```bash
docker-compose up -d
```

### 2) Configure environment

```bash
cp .env.example .env
```

Set:
- `GEMINI_API_KEY`
- `SERPER_API_KEY`

### 3) Install dependencies

```bash
cd api && npm install
cd ../worker && npm install
cd ../frontend && npm install
```

## Run the Services

### API

```bash
cd api
npm run dev
```

### Worker (separate terminal)

```bash
cd worker
npm run dev
```

### Frontend (separate terminal)

```bash
cd frontend
npm run dev
```

Frontend URL: `http://localhost:5173`

Make sure API is running first on `http://localhost:3000`.

## Frontend Notes

- Frontend uses Next.js + Tailwind + TanStack Query.
- Frontend is intentionally **not** dockerized for this assignment.
- Docker Compose includes infrastructure only (`mongodb`, `redis`).

## Complete Flow Walkthrough

1. Create job:
   - `POST /api/jobs`
2. Create sourcing task:
   - `POST /api/jobs/:id/sourcing-tasks`
3. Poll task status:
   - `GET /api/tasks/:taskId`
4. Score candidate:
   - `POST /api/candidates/:id/scores`
5. Queue outreach:
   - `POST /api/candidates/:id/outreach`
6. Process candidate response:
   - `POST /api/candidates/:id/responses`

The worker logs each stage and task transitions can be observed via `/api/tasks/:taskId`.

## UI Flow Walkthrough

1. Open `http://localhost:5173`.
2. On Jobs page, click **Create Job**, fill form, submit.
3. On Job Detail page, click **Source Candidates**, optionally set query/limit, confirm.
4. See task status update live (`queued` -> `processing` -> `completed/failed`).
5. After completion, candidates list refreshes automatically.
6. Open a candidate profile, click **Score Candidate** and monitor task status.
7. Click **Send Outreach** and monitor task status.
8. Click **Simulate Response**, submit a message, and view intent result.

## API Endpoints

### Jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:id` - Get job details (with Redis cache)
- `GET /api/jobs/:jobId/candidates` - List candidates for a job (with Redis cache)
- `POST /api/jobs/:jobId/sourcing-tasks` - Enqueue sourcing task

### Candidates
- `POST /api/candidates/:id/scores` - Enqueue candidate scoring
- `POST /api/candidates/:id/outreach` - Enqueue outreach
- `POST /api/candidates/:id/responses` - Enqueue response intent processing

### Tasks
- `GET /api/tasks/:taskId` - Task status/result/error

## Queue Topology (BullMQ)

Queues:
1. `sourcing-queue`
2. `scoring-queue`
3. `outreach-queue`
4. `response-queue`

All queues use:
- `attempts: 3`
- `backoff: { type: "exponential", delay: 2000 }`

## Caching Strategy

Redis keys:
1. AI scores:
   - key: `score:${candidateId}:${jobId}`
   - TTL: 86400 seconds (24h)
2. Job details:
   - key: `job:${jobId}`
   - TTL: 3600 seconds (1h)
3. Candidate list per job:
   - key: `candidates:${jobId}`
   - TTL: 300 seconds (5m)
   - invalidated when sourcing inserts/upserts candidates for the job

If Redis is unavailable, API and worker continue (graceful degradation), skipping cache reads/writes.

## Error Handling Conventions

Response standards:
- Success: `{ success: true, data: <payload> }`
- Error: `{ success: false, error: "<message>", code?: "<ERROR_CODE>" }`
- List: `{ success: true, data: <array>, total: number, page: number }`

Task failures are written to `Task.error` and `Task.status=failed`. Worker errors do not crash process-level execution.

## Scalability & Production Readiness

While the current architecture leverages BullMQ and Redis for async orchestration, taking this system to production requires hardening and elastic scalability:

### Infrastructure & Scaling
- **Container Orchestration**: Migrate from monolithic Docker deployments to **Kubernetes (K8s)** or **AWS ECS/EKS** to manage the API and Worker pods independently.
- **Elastic Auto-Scaling**: Implement **AWS Auto Scaling** (or HPA in Kubernetes) bound to BullMQ queue depth (e.g., using KEDA). This allows worker nodes to scale out dynamically during massive sourcing or scoring batch runs, and scale in during idle periods.

### AI & LLM Optimization
- **Prompt Caching & Cost Reduction**: Integrate **LMCache** (or similar KV-cache sharing systems) to drastically reduce latency and inference costs when evaluating hundreds of candidates against the same job description context.
- **RAG Pipeline Enhancements**: Upgrade the candidate evaluation flow with a robust Retrieval-Augmented Generation (RAG) architecture. Implement vector embeddings (e.g., Pinecone/Qdrant) for resume/profile data to retrieve semantic matches against job requirements rather than relying on full context window ingestion per evaluation.

### Core Features & Integrations
- **Direct Outreach Integration**: Transition from generating outreach drafts to autonomous execution. Integrate with ESPs (e.g., SendGrid, AWS SES) or LinkedIn APIs to send campaigns directly, utilizing webhooks for delivery/open/click tracking.
- **Contact Enrichment Pipeline**: Implement a waterfall enrichment strategy (e.g., Apollo, Clearbit, ZoomInfo) prior to outreach to maximize deliverability.

### Reliability & Observability
- **Resilience**: Implement Dead Letter Queues (DLQ) with automated retry backoffs and alerting (PagerDuty/Slack) for poisoned tasks.
- **Observability**: Add distributed tracing (OpenTelemetry) and structured logging (pino/ELK stack) to track candidate lifecycles across microservices.
- **API Hardening**: Introduce strict schema validation (Zod), rate limiting, and idempotency keys to prevent duplicate task execution.
- **Security**: Integrate comprehensive AuthN/AuthZ (e.g., OAuth2, RBAC) for multi-tenant recruiter isolation.
