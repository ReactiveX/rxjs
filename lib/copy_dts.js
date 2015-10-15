var glob = require('glob');
var path = require('path');
var fs = require('fs-extra');

glob.sync('dist/es6/**/*.d.ts').forEach(function(file) {
  var info = path.parse(file);
  var dirs = info.dir.split('/');
  var outDir = ['dist', 'cjs'].concat(dirs.slice(2)).join('/');
  var outFile = path.join(outDir, info.base);

  console.log(file + ' -> ' + outFile);
  fs.copySync(file, outFile);
});