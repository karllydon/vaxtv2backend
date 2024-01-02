const webpack = require('webpack');
const path = require("path");
const nodeExternals = require("webpack-node-externals");
const { NormalModuleReplacementPlugin, DefinePlugin } = require("webpack");

require("dotenv").config({ path: "./.env" });

module.exports = {
  entry: "./index.ts",
  output: {
    path: path.resolve(__dirname),
    filename: "api.bundle.js",
    hashFunction: 'sha256',
  },
  externals: [nodeExternals()],
  target: "node",
  resolve: {
    extensions: [".ts", ".js", ".mjs", ".cjs"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        include: __dirname,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto", // Necessary for properly resolving mjs
      },
    ],
  },
  plugins: [
    // Ignore knex dynamic required dialects that we don't use
    new NormalModuleReplacementPlugin(
      /m[sy]sql2?|oracle(db)?|sqlite3|pg-(native|query)/,
      "noop2"
    ),
    new DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};
