const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { ChatGroq } = require("@langchain/groq");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");
const { redisGet, redisSet } = require("../config/redis");

function parseJsonFromAI(rawText) {
  if (!rawText) throw new Error("Empty AI response");

  const cleaned = rawText
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

 function getModel() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");
  return new ChatGroq({
    apiKey,
    model: "llama-3.3-70b-versatile",
    temperature: 0.2
  });
}

async function scoreCandidate(candidateId, jobId) {
  const cacheKey = `score:${candidateId}:${jobId}`;

  const cached = await redisGet(cacheKey);
  if (cached) {
    return { ...JSON.parse(cached), cached: true };
  }

  const [candidate, job] = await Promise.all([
    Candidate.findById(candidateId),
    Job.findById(jobId),
  ]);

  if (!candidate) throw new Error("Candidate not found");
  if (!job) throw new Error("Job not found");

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a technical recruiter AI. Score candidates objectively. Return valid JSON only.",
    ],
    [
      "human",
      `Job Title: ${job.title}
Job Description: ${job.description || ""}
Requirements: ${(job.requirements || []).join(", ")}

Candidate: ${candidate.name || "Unknown"}
Current Role: ${candidate.currentTitle || "Unknown"} at ${candidate.currentCompany || "Unknown"}
Skills: ${(candidate.skills || []).join(", ")}
Experience: ${candidate.experience || 0} years

Return JSON only:

{{
  "score": <0-100>,
  "reasoning": "<2-3 sentences>",
  "strengths": ["<strength1>", "<strength2>"],
  "gaps": ["<gap1>", "<gap2>"]
}}`,
    ],
  ]);

  const chain = prompt.pipe(getModel());
  const response = await chain.invoke({});

  const parsed = parseJsonFromAI(response.content.toString());

  const normalizedScore = Math.max(0, Math.min(100, Number(parsed.score || 0)));

  const result = {
    score: normalizedScore,
    reasoning: parsed.reasoning || "",
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
  };

  candidate.aiScore = {
    score: result.score,
    reasoning: result.reasoning,
    scoredAt: new Date(),
  };

  candidate.status = "scored";

  await candidate.save();

  await redisSet(cacheKey, JSON.stringify(result), 86400);

  return result;
}

module.exports = { scoreCandidate,getModel };
