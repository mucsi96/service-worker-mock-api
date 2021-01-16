const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const {
  MockApiServiceWorkerWebpackPlugin,
} = require("mock-api/lib/MockApiServiceWorkerWebpackPlugin");

module.exports = {
  mode: "development",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      favicon: require.resolve("jasmine-core/images/jasmine_favicon.png"),
    }),
    new MockApiServiceWorkerWebpackPlugin(),
  ],
  devtool: "inline-source-map",
};
