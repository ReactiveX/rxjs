import { beforeAll, describe, expect, it } from 'vitest';
import { rxTest } from '../../../test/src/index.js';

const requestedMode = process.env.RXJS_NEXT_TEST_MODE ?? 'polyfill';
const nativeAvailableAtLoad = typeof globalThis.Observable === 'function';
const ambientObservableAtLoad = globalThis.Observable;
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
    assertNativeObservableIdentity();
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--a--b--|');
      if (requestedMode === 'native') {
        expect(source.constructor).toBe(ambientObservableAtLoad);
      }
      expectObservable(source).toBe('--a--b--|');
      expectObservable(source, '---^').toBe('-----b--|');
      expectSubscriptions(source.subscriptions).toBe('^-------!');
    });
  });

  platformIt('restarts after the last observer leaves', async () => {
    if (!available) {
      return;
    }
    assertNativeObservableIdentity();
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
    assertNativeObservableIdentity();
    await rxTest(({ expectObservable }) => {
      const source = new Observable<string>((subscriber) => {
        const handle = setTimeout(() => {
          subscriber.next('ready');
          subscriber.complete();
        }, 5);
        subscriber.addTeardown(() => clearTimeout(handle));
      });
      if (requestedMode === 'native') {
        expect(source.constructor).toBe(ambientObservableAtLoad);
      }
      expectObservable(source).toBe('5ms (a|)', { a: 'ready' });
    });
  });

  platformIt('keeps producer work alive when one observer aborts', async () => {
    if (!available) {
      return;
    }
    assertNativeObservableIdentity();
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--a--b--c--|');
      expectObservable(source, '^--!').toBe('--a');
      expectObservable(source, '-^').toBe('--a--b--c--|');
      expectSubscriptions(source.subscriptions).toBe('^----------!');
    });
  });

  platformIt('ref-counts direct ambient Observable subscriptions and restarts after closure', async () => {
    if (!available) {
      return;
    }
    assertNativeObservableIdentity();
    await rxTest(() => {
      const first = new AbortController();
      const second = new AbortController();
      const restarted = new AbortController();
      let activations = 0;
      let teardowns = 0;

      const source = new Observable<void>((subscriber) => {
        activations++;
        subscriber.addTeardown(() => {
          teardowns++;
        });
      });

      expect(source.constructor).to.equal(globalThis.Observable);
      if (requestedMode === 'native') {
        expect(source.constructor).toBe(ambientObservableAtLoad);
      }
      source.subscribe(undefined, { signal: first.signal });
      setTimeout(() => source.subscribe(undefined, { signal: second.signal }), 1);
      setTimeout(() => first.abort('first observer left'), 2);
      setTimeout(() => {
        expect(activations).to.equal(1);
        expect(teardowns).to.equal(0);
      }, 2);
      setTimeout(() => second.abort('last observer left'), 3);
      setTimeout(() => {
        expect(teardowns).to.equal(1);
        source.subscribe(undefined, { signal: restarted.signal });
      }, 4);
      setTimeout(() => restarted.abort('restart observer left'), 5);
      setTimeout(() => {
        expect(activations).to.equal(2);
        expect(teardowns).to.equal(2);
      }, 6);
    });
  });
});

function assertNativeObservableIdentity(): void {
  if (requestedMode === 'native') {
    expect(globalThis.Observable).toBe(ambientObservableAtLoad);
  }
}
