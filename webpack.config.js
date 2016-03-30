var webpack = require('webpack');

module.exports = {
  target: 'electron',
  entry: './app/app.jsx',
  output: {
    path: './build',
    publicPath: './build/',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/])
  ],
  module: {
    loaders: [
      {test: /\.jsx?$/, loader: 'babel', exclude: /node_modules/, query: {presets: ['es2015', 'react']}},
      {test: /\.css$/, loader: 'style!css'},
      {test: /fonts\/.+\.(woff|woff2|ttf|eot|svg)($|\?)/, loader: 'file?name=fonts/[hash:7].[ext]'}
    ]
  }
};
