const webpack = require("webpack");
const path = require("path");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
const ts = {
  test: /\.(tsx?)$/,
  loader: "ts-loader",
  exclude: [
    [
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, ".serverless"),
      path.resolve(__dirname, ".webpack")
    ]
  ],
  options: {
    transpileOnly: true,
    experimentalWatchApi: true
  }
};

// all files with a `.pug` extension will be handled by `pug-loader`
const pug = {
  test: /\.pug$/,
  use: ["pug-loader"]
};

// Webpack configs
const config = {
  context: __dirname,
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  entry: slsw.lib.entries,
  devtool: slsw.lib.webpack.isLocal
    ? "cheap-module-eval-source-map"
    : "source-map",
  resolve: {
    extensions: [".mjs", ".json", ".ts", ".pug"],
    symlinks: false,
    cacheWithContext: false
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js"
  },
  target: "node",
  externals: [nodeExternals()],
  module: {
    rules: [ts, pug]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development"
    }),
    new CopyWebpackPlugin([
      {
        from: "./template",
        to: path.join(__dirname, ".webpack/service/template")
      }
    ])
  ]
};

module.exports = config;
