var System = require('systemjs');
var path = require('path');

System.config({
  map: { 'rxjs': path.join(__dirname, '..', '..', 'dist', 'package', '/') },
  packages: {
    'rxjs': {main: 'index.js', defaultExtension: 'js' },
    'rxjs/ajax': {main: 'index.js', defaultExtension: 'js' },
    'rxjs/fetch': {main: 'index.js', defaultExtension: 'js' },
    'rxjs/operators': {main: 'index.js', defaultExtension: 'js' },
    'rxjs/testing': {main: 'index.js', defaultExtension: 'js' },
    'rxjs/webSocket': {main: 'index.js', defaultExtension: 'js' }
  }
});

Promise.all([
  System.import('rxjs'),
  System.import('rxjs/ajax'),
  System.import('rxjs/fetch'),
  System.import('rxjs/operators'),
  System.import('rxjs/testing'),
  System.import('rxjs/webSocket'),
]).then(
  function () { console.log('Successfully tested all entry-points with SystemJS!'); },
  function (error) {
    console.error('\n\nFailed to load an entry-points via SystemJS: \n\n', error.message);
    process.exit(-1);
  }
);
