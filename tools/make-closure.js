var compiler = require('google-closure-compiler-js').compile;
var fs = require('fs');
var path = require('path');

module.exports = function makeClosure(sourcePath) {
  var source = fs.readFileSync(sourcePath, 'utf8');

  var compilerFlags = {
    jsCode: [{src: source}],
    languageIn: 'ES2015',
    createSourceMap: true,
    rewritePolyfills: false,
  };

  var output = compiler(compilerFlags);

  var dest = sourcePath.replace(/.js$/, '.min.js');
  var sourceMapDest = dest + '.map';
  output.compiledCode = output.compiledCode + '\n//# sourceMappingURL=' + path.basename(sourceMapDest);

  fs.writeFileSync(dest, output.compiledCode, 'utf8');
  fs.writeFileSync(sourceMapDest, output.sourceMap, 'utf8');
};
