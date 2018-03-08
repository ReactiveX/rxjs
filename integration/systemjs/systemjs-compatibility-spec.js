var System = require('systemjs');
var path = require('path');

System.config({
  map: { 'rxjs': path.join(__dirname, '..', '..', 'dist', 'cjs', '/') },
  packages: { 'rxjs': {main: 'index.js', defaultExtension: 'js' }}
});

Promise.all([
  System.import('rxjs'),
  System.import('rxjs/ajax'),
  System.import('rxjs/operators'),
  System.import('rxjs/testing'),
  System.import('rxjs/websocket'),
]).then(
  function () { console.log('Successfully tested all entry-points with SystemJS!'); },
  function () {
    console.error('\n\nFailed to load an entry-points via SystemJS: \n\n', error.message);
    process.exit(-1);
  }
);
