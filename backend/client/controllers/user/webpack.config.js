const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: slsw.lib.entries,
  target: "node",
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  performance: {
    hints: "warning"
  },
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  optimization: {
    minimize: true
  },
  devtool: "nosources-source-map"
};