const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {

  entry: [
    './popup/src/scripts/index.js'
  ],

  output: {
    filename: 'popup.js',
    path: path.join(__dirname, '../', 'build'),
    publicPath: '/'
  },

  resolve: {
    extensions: ['.js', '.jsx', '.scss', '.json'],
    modules: ['node_modules']
  },

  plugins: [
    new CopyWebpackPlugin([
        { from: 'static' }
    ])
],

  module: {

    loaders: [
      {
        test: /\.(jsx|js)?$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
        include: path.join(__dirname, 'src'),
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
};
