const { readFileSync } = require("fs");
const { resolve } = require("path");
const serviceWorker = readFileSync(
  resolve(__dirname, "mockApiServiceWorker.js"),
  { encoding: "utf8" }
);

// Source: https://webpack.js.org/contribute/writing-a-plugin/#example
class MockApiServiceWorkerWebpackPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      "MockApiServiceWorkerWebpackPlugin",
      (compilation, callback) => {
        compilation.assets["mockApiServiceWorker.js"] = {
          source: () => serviceWorker,
          size: () => serviceWorker.length,
        };

        callback();
      }
    );
  }
}

module.exports = MockApiServiceWorkerWebpackPlugin;
