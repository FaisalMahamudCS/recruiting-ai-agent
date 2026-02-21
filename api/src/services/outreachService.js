const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-1.5-flash",
    temperature: 0.5
  });
}

async function generateOutreachMessage(candidateId, jobId) {
  const [candidate, job] = await Promise.all([
    Candidate.findById(candidateId),
    Job.findById(jobId)
  ]);

  if (!candidate) throw new Error("Candidate not found");
  if (!job) throw new Error("Job not found");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a professional recruiter writing personalized outreach messages."],
    [
      "human",
      `Write a concise LinkedIn outreach message (max 150 words) for:
Candidate: ${candidate.name || "there"}, currently ${candidate.currentTitle || "a professional"} at ${candidate.currentCompany || "their current company"}
Job: ${job.title} at our company
Key requirements: ${(job.requirements || []).slice(0, 3).join(", ")}

Make it personal, not salesy. Return plain text only.`
    ]
  ]);

  const chain = prompt.pipe(getModel());
  const response = await chain.invoke({});
  return response.content.toString().trim();
}

module.exports = { generateOutreachMessage };
