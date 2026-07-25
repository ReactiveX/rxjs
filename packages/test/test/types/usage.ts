import '@rxjs/observable-polyfill';
import { rxTest, type RxTestConfig, type TestPlatformObservable } from '@rxjs/test';

const config = {
  maxVirtualTime: '20s',
  idleBudget: 5,
} satisfies RxTestConfig;

const result: Promise<void> = rxTest(({ observable, expectObservable }) => {
  const source: TestPlatformObservable<number> = observable('12ms (a|)', {
    a: 1,
  });
  expectObservable(source).toBe('12ms (a|)', { a: 1 });
}, config);

void result;
