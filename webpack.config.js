//webpack.config.js
const path = require('path');
// const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  mode: 'development',
  // mode: 'production',
  target: 'node',
  // devtool: 'inline-source-map',
  // plugins: [new NodePolyfillPlugin()],
  entry: {
    pic: './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js', // <--- Will be compiled to this single file
  },
  externals: {
    // fs: 'require("fs")',
    // path: 'require("path")',
    zod: 'commonjs zod',
    'zod-validation-error': 'commonjs zod-validation-error',
    sharp: 'commonjs sharp',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    // modules: ['node_modules'],
    // fallback: { // fallback is for bundling server-side for browser.
    //   path: false,
    //   fs: fs,
    //   // zod: false,
    //   // zod: 'zod/lib/index.js',
    //   // // 'zod-validation-error': false,
    //   // 'zod-validation-error': 'zod-validation-error/dist/index.js',
    //   // // sharp: false,
    //   // sharp: 'sharp/lib/index.js',
    // },
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      // {
      //   test: /\.node$/,
      //   use: 'node-loader',
      // },
    ],
  },
};
