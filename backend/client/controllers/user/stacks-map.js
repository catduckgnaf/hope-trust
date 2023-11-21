module.exports = (resource, logicalId) => {
  if (logicalId.startsWith("Create") && logicalId.endsWith("LambdaFunction")) return { destination: "LambdaFunctionCreate" };
  if (logicalId.startsWith("Get") && logicalId.endsWith("LambdaFunction")) return { destination: "LambdaFunctionGet" };
  if (logicalId.startsWith("Update") && logicalId.endsWith("LambdaFunction")) return { destination: "LambdaFunctionUpdate" };
  if (logicalId.startsWith("Delete") && logicalId.endsWith("LambdaFunction")) return { destination: "LambdaFunctionDelete" };
  if (logicalId.startsWith("Create") && logicalId.endsWith("LambdaFunctionRole")) return { destination: "LambdaFunctionRoleCreate" };
  if (logicalId.startsWith("Get") && logicalId.endsWith("LambdaFunctionRole")) return { destination: "LambdaFunctionRoleGet" };
  if (logicalId.startsWith("Update") && logicalId.endsWith("LambdaFunctionRole")) return { destination: "LambdaFunctionRoleUpdate" };
  if (logicalId.startsWith("Delete") && logicalId.endsWith("LambdaFunctionRole")) return { destination: "LambdaFunctionRoleDelete" };
  if (logicalId.includes("LambdaFunctionRole")) return { destination: "LambdaFunctionRole" };
  if (logicalId.endsWith("LambdaFunction")) return { destination: "LambdaFunction" };
  if (logicalId.includes("LambdaVersion")) return { destination: "LambdaVersion" };
  if (logicalId.startsWith("HttpApiRoute")) return { destination: "HttpApi" };
  if (logicalId.startsWith("HttpApiIntegration")) return { destination: "HttpApiIntegration" };
  if (logicalId.endsWith("LogGroup")) return { destination: "LambdaLogGroup" };
  if (logicalId.startsWith("HttpApiAuthorizer")) return { destination: "HttpApiAuthorizer" };
  if (logicalId.includes("LambdaVersion")) return { destination: "LambdaVersion" };
  if (logicalId.includes("CloudWatchRole")) return { destination: "CloudWatchRole" };
};