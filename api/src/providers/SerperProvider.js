const axios = require("axios");
const BaseSourcingProvider = require("./BaseSourcingProvider");

class SerperProvider extends BaseSourcingProvider {
  async searchCandidates(query, limit = 10) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      throw new Error("SERPER_API_KEY is not configured");
    }

    const linkedinQuery = `site:linkedin.com/in/ "${query}"`;
    console.log("[serper] query:", linkedinQuery);

    const response = await axios.post(
      "https://google.serper.dev/search",
      {
        q: linkedinQuery,
        num: limit,
      },
      {
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      },
    );

    return this.parseResults(response.data);
  }

  parseResults(rawResults) {
    const organic = Array.isArray(rawResults?.organic)
      ? rawResults.organic
      : [];

    console.log(
      "[serper] raw links:",
      organic.map((r) => r.link),
    );

    const results = [];

    for (const item of organic) {
      const link = item?.link || "";
      const title = item?.title || "";
      const snippet = item?.snippet || "";

      // Skip anything that isn't a LinkedIn profile
      if (!link.includes("linkedin.com/in/")) {
        console.log("[serper] skipping non-profile:", link);
        continue;
      }

      // Strip trailing "| LinkedIn" suffix
      const cleanTitle = title.replace(/\s*\|?\s*LinkedIn\s*$/i, "").trim();

      // LinkedIn titles: "Jane Smith - Senior Engineer at Stripe"
      const dashIndex = cleanTitle.indexOf(" - ");
      const name =
        dashIndex !== -1
          ? cleanTitle.substring(0, dashIndex).trim()
          : cleanTitle.split("-")[0].trim();

      if (!name || name.length < 2) {
        console.log("[serper] skipping bad name from:", title);
        continue;
      }

      let currentTitle = "";
      let currentCompany = "";

      if (dashIndex !== -1) {
        const roleSection = cleanTitle.substring(dashIndex + 3);
        const atMatch = roleSection.match(/^(.+?)\s+at\s+(.+)$/i);
        if (atMatch) {
          currentTitle = atMatch[1].trim();
          currentCompany = atMatch[2].trim();
        } else {
          currentTitle = roleSection.trim();
        }
      }

      const skills = snippet
        .split(/[,.|·•]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 2 && t.length < 40)
        .slice(0, 6);

      results.push({
        name,
        linkedinUrl: link,
        currentTitle,
        currentCompany,
        skills,
        sourcedFrom: "serper",
      });
    }

    console.log(`[serper] parsed ${results.length} valid profiles`);
    return results;
  }
}

module.exports = SerperProvider;
