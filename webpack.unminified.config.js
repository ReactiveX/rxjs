var path = require('path');

module.exports = {
  entry: './package/src/internal/umd.ts',
  devtool: 'hidden-source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        include: /package\/src/,
      },
    ],
  },
  resolve: {
    extensions: [ '.ts' ],
    alias: {
      'rxjs': path.resolve(__dirname, 'package/src/'),
    },
  },
  output: {
    path: path.resolve(__dirname, 'package/bundles/'),
    filename: 'rxjs.umd.js',
    library: 'rxjs',
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: false
  }
};
