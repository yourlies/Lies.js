var path = require('path');
module.exports = {
  entry: {
    app: ['./app/main.js']
  },
  module: {    
    loaders: [{    
      test: /\.js$/,    
      exclude: /node_modules/,    
      loader: 'babel-loader'    
    }]    
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/build/',
    filename: 'bundle.js'
  },
}