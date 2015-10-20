var fs = require('fs-extra');
var glob = require('glob');
var jsonfile = require('jsonfile');
var transfer = require('multi-stage-sourcemap').transfer;

glob('dist/es6/**/*.js.map', null, function (er, files) {
  files.forEach(function (file) {
    var source = jsonfile.readFileSync(file);
    var destFile = file.replace('es6', 'cjs');
    var dest = jsonfile.readFileSync(destFile);

    var transferred = transfer({ fromSourceMap: JSON.stringify(dest),
      toSourceMap: JSON.stringify(source) });

    fs.unlink(destFile);
    jsonfile.writeFile(destFile, transferred, function (err) {
      if (err) {
        console.log(err);
      }
    });
  });
});