require('@rxjs/observable-polyfill');
const { rxTest } = require('@rxjs/test');

rxTest(({ cold, expectObservable }) => {
  expectObservable(cold('5ms (a|)')).toBe('5ms (a|)');
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
