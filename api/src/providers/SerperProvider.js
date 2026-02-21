const axios = require("axios");
const BaseSourcingProvider = require("./BaseSourcingProvider");

class SerperProvider extends BaseSourcingProvider {
  async searchCandidates(query, limit = 10) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      throw new Error("SERPER_API_KEY is not configured");
    }

    const response = await axios.post(
      "https://google.serper.dev/search",
      {
        q: query,
        num: limit
      },
      {
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    return this.parseResults(response.data);
  }

  parseResults(rawResults) {
    const organic = Array.isArray(rawResults?.organic) ? rawResults.organic : [];

    return organic
      .map((item) => {
        const title = item?.title || "";
        const snippet = item?.snippet || "";
        const link = item?.link || "";

        const name = title.split("-")[0]?.trim() || "Unknown Candidate";

        let currentTitle = "";
        let currentCompany = "";
        const titleParts = title.split("-");
        if (titleParts.length > 1) {
          const roleAndCompany = titleParts[1].split(" at ");
          currentTitle = (roleAndCompany[0] || "").trim();
          currentCompany = (roleAndCompany[1] || "").trim();
        }

        const skills = snippet
          .split(/[,.|]/)
          .map((token) => token.trim())
          .filter((token) => token.length > 2)
          .slice(0, 6);

        return {
          name,
          linkedinUrl: link.includes("linkedin.com") ? link : undefined,
          currentTitle,
          currentCompany,
          skills,
          sourcedFrom: "serper"
        };
      })
      .filter((candidate) => Boolean(candidate.linkedinUrl));
  }
}

module.exports = SerperProvider;
