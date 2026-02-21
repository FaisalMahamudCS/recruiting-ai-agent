class BaseSourcingProvider {
  async searchCandidates() {
    throw new Error("Not implemented");
  }

  parseResults() {
    throw new Error("Not implemented");
  }
}

module.exports = BaseSourcingProvider;
