const config = require('./webpack.config');

module.exports = {
  ...config,
  entry: config.entry.index,
  externals: [
    {
      react: {
        root: 'React',
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react',
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs: 'react-dom',
        commonjs2: 'react-dom',
        amd: 'react-dom',
      },
    },
  ],
  output: {
    library: 'react-control-panel',
    libraryTarget: 'umd',
    path: __dirname + '/dist',
    filename: 'index.js',
  },
  mode: 'production',
  optimization: {
    minimize: false,
  },
  devtool: 'source-map',
};
