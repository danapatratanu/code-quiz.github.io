const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = {
  context: `${__dirname}/src`,

  entry: './js/scripts.js',

  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
  },

  devtool: 'inline-source-map',

  devServer: {
    contentBase: `${__dirname}/src/`,
    publicPath: '/',
  },

  module: {
    rules: [
      {
        test: /\.js?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [autoprefixer]
              }
            }
          },
          'sass-loader'
          ],
        }),
      },
      {
        test: /\.woff2$/,
        loader: 'file-loader'
      },
      {
        test: /\.svg$/,
        loader: 'file-loader'
      },
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor']
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [
          autoprefixer(),
        ]
      }
    }),
    new ExtractTextPlugin('style.css'),
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
  ]
};