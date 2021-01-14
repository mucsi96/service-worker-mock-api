const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const {
  MockApiServiceWorkerWebpackPlugin,
} = require("mock-api/lib/MockApiServiceWorkerWebpackPlugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin(),
    new MockApiServiceWorkerWebpackPlugin(),
  ],
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./public",
  },
};
