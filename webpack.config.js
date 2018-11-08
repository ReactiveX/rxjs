var path = require('path');
var TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

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
    plugins: [new TsconfigPathsPlugin({ /*configFile: "./path/to/tsconfig.json" */ })],
  },
  output: {
    path: path.resolve(__dirname, 'package/bundles/'),
    filename: 'rxjs.umd.min.js',
    library: 'rxjs',
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: true
  }
};
