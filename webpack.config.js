const path = require('path');

module.exports = {
  entry: {
    index: './src/index.js',
    demo: './demo/index.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
    modules: [path.resolve('node_modules'), path.resolve(__dirname, './src')],
  },
  plugins: [],
  devServer: {
    // contentBase: path.join(__dirname, 'dist'),
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 9001,
  },
};
