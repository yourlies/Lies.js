var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    app: ['./app/main.js']
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      except: ['$super', '$', 'exports', 'require']
    })
  ],
  module: {    
    loaders: [{    
      test: /\.js$/,    
      exclude: /node_modules/,    
      loader: 'babel-loader'    
    }]    
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/assets/',
    filename: 'bundle.js'
  }
}