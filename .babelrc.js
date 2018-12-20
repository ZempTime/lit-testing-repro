module.exports = {
  env: {
    development: {
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            exclude: ["transform-async-to-generator", "transform-regenerator"]
          }
        ]
      ],
      plugins: [
        [
          "module:fast-async",
          {
            spec: true
          }
        ]
      ]
    }
  }
};
