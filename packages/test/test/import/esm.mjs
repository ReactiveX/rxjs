import '@rxjs/observable-polyfill';
import { rxTest } from '@rxjs/test';

await rxTest(({ cold, expectObservable }) => {
  expectObservable(cold('5ms (a|)')).toBe('5ms (a|)');
});
