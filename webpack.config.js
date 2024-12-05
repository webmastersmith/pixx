//webpack.config.js
const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  mode: 'production',
  // devtool: 'inline-source-map',
  // plugins: [new NodePolyfillPlugin()],
  entry: {
    pic: './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name]-bundle.js', // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    // modules: ['node_modules'],
    fallback: {
      path: false,
      fs: false,
      // zod: false,
      // zod: 'zod/lib/index.js',
      // // 'zod-validation-error': false,
      // 'zod-validation-error': 'zod-validation-error/dist/index.js',
      // // sharp: false,
      // sharp: 'sharp/lib/index.js',
    },
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        // test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
};
