import '@rxjs/observable-polyfill';
import { rxTest, type RxTestConfig, type TestMessage, type TestPlatformObservable } from '@rxjs/test';

declare module '@rxjs/test' {
  interface TestMessage<T = unknown> {
    readonly adapterMetadata?: { readonly source: string };
  }
}

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

const augmentedMessage: TestMessage<number> = {
  frame: 0,
  notification: { kind: 'N', value: 1 },
  adapterMetadata: { source: 'downstream-adapter' },
};

void result;
void augmentedMessage;
