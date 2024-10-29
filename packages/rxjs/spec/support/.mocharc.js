module.exports = {
  require: ['ts-node/register', 'spec/helpers/setup.ts'],
  reporter: 'spec',
  'full-trace': true,
  'stack-trace-limit': 25,
  extensions: ['ts', 'js'],
  timeout: 5000,
  recursive: true,
  'enable-source-maps': true,
  'expose-gc': true,
  // Uncomment this to find all skipped tests.
  // forbidPending: true
};
