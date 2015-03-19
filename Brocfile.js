var esTranspiler = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');

var rxjs2 = pickFiles('node_modules/rx/dist', {
	srcDir: '/',
	files: ['rx.js'],
	destDir: '/assets/rxjs2'
});

var benchmark = pickFiles('node_modules/benchmark', {
	srcDir: '/',
	files: ['benchmark.js'],
	destDir: '/assets/benchmark'
});

var lodash = pickFiles('node_modules/lodash', {
	srcDir: '/',
	files: ['index.js'],
	destDir: '/assets/lodash'
});

var platform = pickFiles('node_modules/platform', {
	srcDir: '/',
	files: ['platform.js'],
	destDir: '/assets/platform'
});

var perfFiles = pickFiles('perf', {
	srcDir: '/',
	files: ['**/*.html', '**/*.js'],
	destDir: '/perf'
});

var requirejs = pickFiles('node_modules/requirejs', {
	srcDir: '/',
	files: ['require.js'],
	destDir: '/assets/requirejs'
});

var jasmine = pickFiles('node_modules/jasmine-core', {
	srcDir: '/lib/jasmine-core',
	files: ['jasmine.css', 'jasmine.js', 'jasmine-html.js', 'boot.js'],
	destDir: '/assets/jasmine'
});

var specRunner = pickFiles('lib', {
	srcDir: '/',
	files: ['specRunner.js'],
	destDir: '/assets'
});

var testHTML = pickFiles('tests', {
	srcDir: '/',
	files: ['index.html'],
	destDir: '/'
});

var srcES6 = pickFiles('src', {
  srcDir: '/',
  files: ['**/*.js'],
  destDir: '/src'
});

var testsES6 = pickFiles('tests', {
  srcDir: '/',
  files: ['**/*.js'],
  destDir: '/tests'
});

var scripts = esTranspiler(mergeTrees([srcES6, testsES6]), {
	sourceMap: 'inline',
	modules: 'amd',
	moduleIds: true
});


module.exports = mergeTrees([
	scripts, 
	testHTML, 
	jasmine, 
	requirejs, 
	specRunner, 
	perfFiles, 
	benchmark,
	rxjs2,
	lodash,
	platform
]);


