import { beforeAll, describe, it } from 'vitest';
import { rxTest } from '../../../test/src/index.js';

const requestedMode = process.env.RXJS_NEXT_TEST_MODE ?? 'polyfill';
const nativeAvailableAtLoad = typeof globalThis.Observable === 'function';
const platformIt = requestedMode === 'native' && !nativeAvailableAtLoad ? it.skip : it;
let available = true;

beforeAll(async () => {
  if (requestedMode === 'native') {
    available = typeof globalThis.Observable === 'function';
  } else {
    await import('@rxjs/observable-polyfill');
  }
});

describe(`ported platform lifecycle evidence (${requestedMode})`, () => {
  platformIt('uses the active global Observable and shares one producer activation', async () => {
    if (!available) {
      return;
    }
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--a--b--|');
      expectObservable(source).toBe('--a--b--|');
      expectObservable(source, '---^').toBe('-----b--|');
      expectSubscriptions(source.subscriptions).toBe('^-------!');
    });
  });

  platformIt('restarts after the last observer leaves', async () => {
    if (!available) {
      return;
    }
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--a--b--|');
      expectObservable(source, '^--!').toBe('--a');
      expectObservable(source, '-----^').toBe('-------a--b--|');
      expectSubscriptions(source.subscriptions).toBe(['^--!', '-----^-------!']);
    });
  });

  platformIt('constructs direct platform sources from the global Observable', async () => {
    if (!available) {
      return;
    }
    await rxTest(({ expectObservable }) => {
      const source = new Observable<string>((subscriber) => {
        const handle = setTimeout(() => {
          subscriber.next('ready');
          subscriber.complete();
        }, 5);
        subscriber.addTeardown(() => clearTimeout(handle));
      });
      expectObservable(source).toBe('5ms (a|)', { a: 'ready' });
    });
  });
});
