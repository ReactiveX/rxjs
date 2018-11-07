var compiler = require('google-closure-compiler-js').compile;
var fs = require('fs');

var source = fs.readFileSync('package/bundles/rxjs.umd.js', 'utf8');

var compilerFlags = {
  jsCode: [{src: source}],
  languageIn: 'ES2015',
  createSourceMap: true,
};

var output = compiler(compilerFlags);

fs.writeFileSync('package/bundles/rxjs.umd.min.js', output.compiledCode, 'utf8');
fs.writeFileSync('package/bundles/rxjs.umd.min.js.map', output.sourceMap, 'utf8');
