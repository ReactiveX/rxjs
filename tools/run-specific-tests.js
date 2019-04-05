var spawn = require('child_process').spawn;

var files = process.argv[2].split(',');
files = files.map(function (spec) {
  return 'spec/**/' + spec + '-spec.ts';
});

var rest = process.argv.slice(3);
var command = [
  'npm',
  'run',
  'test_base',
  '--',
].concat(files, rest);

console.log('> ' + command.join(' '));

var runner = spawn(command[0], command.slice(1), {
  cwd: process.cwd(),
  stdio: 'inherit',
});

runner.on('close', function (code) {
  return process.exit(code);
});
