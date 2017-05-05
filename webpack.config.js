const path = require('path');

const config = {
  entry: './index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    library: 'nowClient',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      }
    ]
  },
  externals: {
    "axios": {
        commonjs: "axios",
        commonjs2: "axios",
        amd: "axios",
        root: "axios"
    }
  }
};

module.exports = config;
