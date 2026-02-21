const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { ChatGroq } = require("@langchain/groq");
const { getModel } = require("./scoringService");



function parseJsonFromAI(rawText) {
  const cleaned = rawText
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(cleaned);
}

async function classifyIntent(message) {
  const model = getModel();

  const response = await model.invoke([
    {
      role: "system",
      content:
        "Classify the intent of this candidate response. Return JSON only.",
    },
    {
      role: "human",
      content: `Message: "${message}"

Return JSON only:
{
  "intent": "interested or not_interested",
  "confidence": 0.0 to 1.0
}`,
    },
  ]);

  const parsed = parseJsonFromAI(response.content.toString());

  const intent =
    parsed.intent === "interested" ? "interested" : "not_interested";
  const confidence = Math.max(0, Math.min(1, Number(parsed.confidence || 0)));

  if (intent === "interested") {
    return {
      intent,
      confidence,
      schedulingLink: "https://cal.example.com/recruiter/intro-call",
      reply:
        "Great to hear from you. Please pick a time that works for a quick intro call.",
    };
  }

  return {
    intent,
    confidence,
    reply:
      "Thanks for the response. Appreciate your time and we wish you the best.",
  };
}

module.exports = { classifyIntent };
