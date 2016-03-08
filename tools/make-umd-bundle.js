var browserify = require('browserify');
var fs = require('fs');

var b = browserify('dist/cjs/Rx.js', {
  baseDir: 'dist/cjs',
  standalone: 'Rx'
});
b.bundle().pipe(fs.createWriteStream('dist/global/Rx.umd.js'));


var b = browserify('dist/cjs/Rx.KitchenSink.js', {
  baseDir: 'dist/cjs',
  standalone: 'Rx.KitchenSink'
});
b.bundle().pipe(fs.createWriteStream('dist/global/Rx.KitchenSink.umd.js'));
