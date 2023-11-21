const getPlaidEnvironment = () => {
  if (process.env.IS_LOCALHOST === "true") return "sandbox";
  if (process.env.STAGE === "development") return "sandbox";
  if (process.env.STAGE === "staging") return "development";
  if (process.env.STAGE === "production") return "production";
  return "sandbox";
};

module.exports = { getPlaidEnvironment };