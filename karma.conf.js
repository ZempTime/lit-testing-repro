const { join } = require("path");
const DEP_DIR = "./node_modules";

module.exports = function(config) {
  config.set({
    basePath: "",
    autoWatch: true,
    processKillTimeout: 10000,
    browserDisconnectTimeout: 10000,
    browsers: ["ChromeHeadlessNoSandbox", "FirefoxHeadless"],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: ["--disable-gpu", "--no-sandbox"]
      },
      FirefoxHeadless: {
        base: "Firefox",
        flags: ["-headless"]
      }
    },
    frameworks: ["mocha", "sinon-chai"],
    files: [
      {
        pattern: `${DEP_DIR}/@webcomponents/webcomponentsjs/webcomponents-bundle.js`,
        watched: false
      },
      "test/unit/index.js"
    ],
    preprocessors: {
      "test/unit/index.js": ["webpack", "sourcemap"]
    },
    reporters: ["mocha"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    client: {
      mocha: {
        reporter: "html",
        ui: "bdd",
        timeout: 10000 // TODO Is this wise to increase? Can be sign of element design inefficiency
      },
      chai: {
        includeStack: true
      }
    },

    webpack: {
      devtool: "inline-source-map",
      mode: "development",
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            options: {
              babelrc: true,
              extends: join(__dirname + "/.babelrc"),
              cacheDirectory: true,
              envName: "development"
            }
          }
        ]
      }
    },

    resolve: {
      alias: {
        node_modules: `${DEP_DIR}`
      }
    },

    webpackMiddleware: {
      stats: "none"
    },

    webpackServer: {
      noInfo: true
    }
  });
};
