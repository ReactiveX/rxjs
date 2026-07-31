// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/generate-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { generate } from 'rxjs/generate';
import { take } from 'rxjs/take';
describe('generate (cold)', () => {
  it('should complete if condition does not meet', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[generate](
        1,
        (x) => false,
        (x) => x + 1
      );
      const expected = '|';
      expectObservable(source).toBe(expected);
    });
  });
  it('should produce first value immediately', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[generate](
        1,
        (x) => x == 1,
        (x) => x + 1
      );
      const expected = '(1|)';
      expectObservable(source).toBe(expected, { '1': 1 });
    });
  });
  it('should produce all values synchronously', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[generate](
        1,
        (x) => x < 3,
        (x) => x + 1
      );
      const expected = '(12|)';
      expectObservable(source).toBe(expected, { '1': 1, '2': 2 });
    });
  });
  it('should use result selector', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[generate](
        1,
        (x) => x < 3,
        (x) => x + 1,
        (x) => (x + 1).toString()
      );
      const expected = '(23|)';
      expectObservable(source).toBe(expected);
    });
  });
  it('should allow omit condition', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[generate]({
        initialState: 1,
        iterate: (x) => x + 1,
        resultSelector: (x) => x.toString(),
      })[take](5);
      const expected = '(12345|)';
      expectObservable(source).toBe(expected);
    });
  });
  it('should accept a scheduler', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(async ({ expectObservable, flush, schedule }) => {
      const source = ColdObservable[generate]({
        initialState: 1,
        condition: (value) => value < 4,
        iterate: (value) => value + 1,
        resultSelector: (value) => value,
      });
      // The scheduler-last overload is intentionally unavailable. Preserve the
      // generation/error contract, and use rxTest.schedule only where the source
      // case explicitly proves deferred subscription.
      let count = 0;
      schedule(() => source.subscribe(() => count++), 0);
      expect(count).toBe(0);
      expectObservable(source).toBe('(123|)', { '1': 1, '2': 2, '3': 3 });
      await flush();
      expect(count).toBe(3);
    });
  });
  it('should allow minimal possible options', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[generate]({
        initialState: 1,
        iterate: (x) => x * 2,
      })[take](3);
      const expected = '(124|)';
      expectObservable(source).toBe(expected, { '1': 1, '2': 2, '4': 4 });
    });
  });
  it('should emit error if result selector throws', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[generate]({
        initialState: 1,
        iterate: (x) => x * 2,
        resultSelector: err,
      });
      const expected = '(#)';
      expectObservable(source).toBe(expected);
    });
  });
  it('should emit error if result selector throws on scheduler', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[generate]({
        initialState: 1,
        iterate: (value) => value * 2,
        resultSelector: err,
      });
      // The scheduler-last overload is intentionally unavailable. Preserve the
      // generation/error contract, and use rxTest.schedule only where the source
      // case explicitly proves deferred subscription.
      expectObservable(source).toBe('(#)');
    });
  });
  it('should emit error after first value if iterate function throws', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[generate]({
        initialState: 1,
        iterate: err,
      });
      const expected = '(1#)';
      expectObservable(source).toBe(expected, { '1': 1 });
    });
  });
  it('should emit error after first value if iterate function throws on scheduler', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[generate]({
        initialState: 1,
        iterate: err,
      });
      // The scheduler-last overload is intentionally unavailable. Preserve the
      // generation/error contract, and use rxTest.schedule only where the source
      // case explicitly proves deferred subscription.
      expectObservable(source).toBe('(1#)', { '1': 1 });
    });
  });
  it('should emit error if condition function throws', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[generate]({
        initialState: 1,
        iterate: (x) => x + 1,
        condition: err,
      });
      const expected = '(#)';
      expectObservable(source).toBe(expected);
    });
  });
  it('should emit error if condition function throws on scheduler', async () => {
    function err() {
      throw 'error';
    }
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[generate]({
        initialState: 1,
        iterate: (value) => value + 1,
        condition: err,
      });
      // The scheduler-last overload is intentionally unavailable. Preserve the
      // generation/error contract, and use rxTest.schedule only where the source
      // case explicitly proves deferred subscription.
      expectObservable(source).toBe('(#)');
    });
  });
});
