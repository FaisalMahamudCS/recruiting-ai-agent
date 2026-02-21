const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-1.5-flash",
    temperature: 0.1
  });
}

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
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Classify the intent of this candidate response. Return JSON only."],
    [
      "human",
      `Message: "${message}"
Return: { "intent": "interested" | "not_interested", "confidence": 0-1 }`
    ]
  ]);

  const chain = prompt.pipe(getModel());
  const response = await chain.invoke({});
  const parsed = parseJsonFromAI(response.content.toString());

  const intent = parsed.intent === "interested" ? "interested" : "not_interested";
  const confidence = Math.max(0, Math.min(1, Number(parsed.confidence || 0)));

  if (intent === "interested") {
    return {
      intent,
      confidence,
      schedulingLink: "https://cal.example.com/recruiter/intro-call",
      reply: "Great to hear from you. Please pick a time that works for a quick intro call."
    };
  }

  return {
    intent,
    confidence,
    reply: "Thanks for the response. Appreciate your time and we wish you the best."
  };
}

module.exports = { classifyIntent };
