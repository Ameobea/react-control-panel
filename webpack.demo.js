const config = require('./webpack.prod');

module.exports = {
  ...config,
  entry: './demo/index.js',
  externals: undefined,
  output: {
    path: __dirname + '/dist',
    filename: 'demo.js',
  },
};
