var _ = require('lodash');
var colors = require('colors');
var glob = require('glob');
var fs = require('fs');
var ts = require('typescript');

function diagnose(fileNames, options) {
  var program = ts.createProgram(fileNames, options);

  var diagnostics = _.groupBy(ts.getPreEmitDiagnostics(program),
    function (x) {
      return x.file.fileName;
    });

  _.forIn(diagnostics, function (value, key) {
    fs.readFile(key, 'utf-8' ,function (err, file) {
      var lines = file.split('\n');
      _.forEach(value, function (diagnostic) {
        var pos = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

        var prefix = ' (' + key + ': ' + pos.line + ',' + pos.character + ') ';
        console.error('Error : '.red + message + prefix);
        console.error(lines[pos.line].gray);
        console.error(_.repeat(' ', pos.character) + '^');
        console.error();
      });
    });
  });
}

glob('types/**/*.ts', function (err, files) {
  files.unshift('typings/es6-shim/es6-shim.d.ts');
  diagnose(files, {
    module: ts.ModuleKind.CommonJS
  });
});