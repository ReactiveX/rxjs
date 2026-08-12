// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/buffer-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { buffer } from 'rxjs/buffer';
import { ColdObservable } from 'rxjs/cold-observable';
import { EMPTY } from 'rxjs/empty';
import { mergeMap } from 'rxjs/merge-map';
import { NEVER } from 'rxjs/never';
import { take } from 'rxjs/take';
import { window } from 'rxjs/window';
describe('buffer (cold)', () => {
  it('should emit buffers that close and reopen', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const a = hot('   -a-b-c-d-e-f-g-h-i-|');
      const b = hot('   -----B-----B-----B-|');
      const expected = '-----x-----y-----z-(F|)';
      const expectedValues = {
        x: ['a', 'b', 'c'],
        y: ['d', 'e', 'f'],
        z: ['g', 'h', 'i'],
        F: [],
      };
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(
        expected,
        expectedValues
      );
    });
  });
  it('should emit a final buffer if the closingNotifier is already complete', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const a = hot('   -a-b-c-d-e-f-g-h-i-|');
      const b = hot('   -----B-----B--|');
      const expected = '-----x-----y-------(F|)';
      const expectedValues = {
        x: ['a', 'b', 'c'],
        y: ['d', 'e', 'f'],
        F: ['g', 'h', 'i'],
      };
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(
        expected,
        expectedValues
      );
    });
  });
  it('should emit all buffered values if the source completes before the closingNotifier does', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('---^---a---b---c---d---e--f----|');
      const sourceSubs = '   ^---------------------------!';
      const closer = hot('---^-------------B----------------');
      const closerSubs = '   ^---------------------------!';
      const expected = '     --------------x-------------(F|)';
      const result = source[buffer]({ delay: () => closer, emitEmpty: true, emitRemainingOnError: false, restartDelay: false });
      const expectedValues = {
        x: ['a', 'b', 'c'],
        F: ['d', 'e', 'f'],
      };
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closer.subscriptions).toBe(closerSubs);
    });
  });
  it('should work with empty and empty selector', async () => {
    await rxTest(({ expectObservable }) => {
      const a = EMPTY;
      const b = EMPTY;
      const expected = '(F|)';
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(expected, {
        F: [],
      });
    });
  });
  it('should work with empty and non-empty selector', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const a = EMPTY;
      const b = hot('-----a-----');
      const expected = '(F|)';
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(expected, {
        F: [],
      });
    });
  });
  it('should work with non-empty and empty selector', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const b = EMPTY;
      const expected = '     --------------------------------(F|)';
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(expected, {
        F: ['3', '4', '5', '6', '7', '8', '9', '0'],
      });
    });
  });
  it('should work with never and never selector', async () => {
    await rxTest(({ expectObservable }) => {
      const a = NEVER;
      const b = NEVER;
      const expected = '-';
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false }), '^!').toBe(
        expected
      );
    });
  });
  it('should work with never and empty selector', async () => {
    await rxTest(({ expectObservable }) => {
      const a = NEVER;
      const b = EMPTY;
      const expected = '-';
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false }), '^!').toBe(
        expected
      );
    });
  });
  it('should work with empty and never selector', async () => {
    await rxTest(({ expectObservable }) => {
      const a = EMPTY;
      const b = NEVER;
      const expected = '(F|)';
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(expected, {
        F: [],
      });
    });
  });
  it('should work with non-empty and throw selector', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const a = hot('---^--a--');
      const b = new ColdObservable((subscriber) => {
        subscriber.error(new Error('too bad'));
      });
      const expected = '#';
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(
        expected,
        null,
        new Error('too bad')
      );
    });
  });
  it('should work with throw and non-empty selector', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const a = new ColdObservable((subscriber) => {
        subscriber.error(new Error('too bad'));
      });
      const b = hot('---^--a--');
      const expected = '#';
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(
        expected,
        null,
        new Error('too bad')
      );
    });
  });
  it('should work with error', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const a = hot('---^-------#', undefined, new Error('too bad'));
      const b = hot('---^--------');
      const expected = '--------#';
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(
        expected,
        null,
        new Error('too bad')
      );
    });
  });
  it('should work with error and non-empty selector', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const a = hot('---^-------#', undefined, new Error('too bad'));
      const b = hot('---^---a----');
      const expected = '----a---#';
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(
        expected,
        { a: [] },
        new Error('too bad')
      );
    });
  });
  it('should work with selector', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const b = hot('--------^--a-------b---cd---------e---f---|');
      const expected = '     ---a-------b---cd---------e---f-(F|)';
      const expectedValues = {
        a: ['3'],
        b: ['4', '5'],
        c: ['6'],
        d: [],
        e: ['7', '8', '9'],
        f: ['0'],
        F: [],
      };
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(
        expected,
        expectedValues
      );
    });
  });
  it('should work with selector completed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const subs = '         ^-------------------------------!';
      const b = hot('--------^--a-------b---cd|               ');
      const expected = '     ---a-------b---cd---------------(F|)';
      const expectedValues = {
        a: ['3'],
        b: ['4', '5'],
        c: ['6'],
        d: [],
        F: ['7', '8', '9', '0'],
      };
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(
        expected,
        expectedValues
      );
      expectSubscriptions(a.subscriptions).toBe(subs);
    });
  });
  it('should allow unsubscribing the result Observable early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const unsub = '        --------------!                  ';
      const subs = '         ^-------------!                  ';
      const b = hot('--------^--a-------b---cd|               ');
      const expected = '     ---a-------b---                  ';
      const expectedValues = {
        a: ['3'],
        b: ['4', '5'],
      };
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false }), unsub).toBe(
        expected,
        expectedValues
      );
      expectSubscriptions(a.subscriptions).toBe(subs);
    });
  });
  it('should not break unsubscription chains when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const subs = '         ^-------------!                  ';
      const b = hot('--------^--a-------b---cd|               ');
      const expected = '     ---a-------b---                  ';
      const unsub = '        --------------!                  ';
      const expectedValues = {
        a: ['3'],
        b: ['4', '5'],
      };
      const result = a[mergeMap]((x) => ColdObservable.from([x]))
        [buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected, expectedValues);
      expectSubscriptions(a.subscriptions).toBe(subs);
    });
  });
  it('should work with non-empty and selector error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('--1--2--^--3-----#', { '3': 3 }, new Error('too bad'));
      const subs = '         ^--------!';
      const b = hot('--------^--a--b---');
      const expected = '     ---a--b--#';
      const expectedValues = {
        a: [3],
        b: [],
      };
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(
        expected,
        expectedValues,
        new Error('too bad')
      );
      expectSubscriptions(a.subscriptions).toBe(subs);
    });
  });
  it('should work with non-empty and empty selector error', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const b = hot('--------^----------------#', undefined, new Error('too bad'));
      const expected = '     -----------------#';
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(
        expected,
        null,
        new Error('too bad')
      );
    });
  });
  it('should work with non-empty and selector error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const obj = { a: true, b: true, c: true };
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const subs = '         ^----------------!';
      const b = hot('--------^--a-------b---c-#', obj, new Error('too bad'));
      const expected = '     ---a-------b---c-#';
      const expectedValues = {
        a: ['3'],
        b: ['4', '5'],
        c: ['6'],
      };
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toBe(
        expected,
        expectedValues,
        new Error('too bad')
      );
      expectSubscriptions(a.subscriptions).toBe(subs);
    });
  });
  it('should unsubscribe notifier when source unsubscribed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const unsub = '        --------------!                  ';
      const subs = '         ^-------------!                  ';
      const b = hot('--------^--a-------b---cd|               ');
      const bsubs = '        ^-------------!                  ';
      const expected = '     ---a-------b---                  ';
      const expectedValues = {
        a: ['3'],
        b: ['4', '5'],
      };
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false }), unsub).toBe(
        expected,
        expectedValues
      );
      expectSubscriptions(a.subscriptions).toBe(subs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should unsubscribe notifier when source unsubscribed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   -a-b-c-d-e-f-g-h-i-|');
      const b = hot('   -----1-----2-----3-|');
      const bsubs = '   ^----!';
      const expected = '-----(x|)';
      const expectedValues = {
        x: ['a', 'b', 'c'],
      };
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })[take](1)).toBe(
        expected,
        expectedValues
      );
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should be equivalent for case 0', async () => {
    const source = '   -a-b-c-d-e-f-g-h-i-|';
    const notifier = ' -----B-----B-----B-|';
    await rxTest(({ hot, expectObservable }) => {
      const a = hot(source);
      const b = hot(notifier);
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toEqual(
        a[window](b)[mergeMap]((w) => w[buffer]({ emitEmpty: true, emitRemainingOnError: false }))
      );
    });
  });
  it('should be equivalent for case 1', async () => {
    const source = '   -a-b-c-d-e-f-g-h-i-|';
    const notifier = ' -----B-----B--|     ';
    await rxTest(({ hot, expectObservable }) => {
      const a = hot(source);
      const b = hot(notifier);
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toEqual(
        a[window](b)[mergeMap]((w) => w[buffer]({ emitEmpty: true, emitRemainingOnError: false }))
      );
    });
  });
  it('should be equivalent for case 2', async () => {
    const source = '   -a-b-c-d-e---------|';
    const notifier = ' -----B-----B-----B-|';
    await rxTest(({ hot, expectObservable }) => {
      const a = hot(source);
      const b = hot(notifier);
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toEqual(
        a[window](b)[mergeMap]((w) => w[buffer]({ emitEmpty: true, emitRemainingOnError: false }))
      );
    });
  });
  it('should be equivalent for case 3', async () => {
    const source = '   -a-b-c-d-e-f-g-h-i-|';
    const notifier = ' -------------------|';
    await rxTest(({ hot, expectObservable }) => {
      const a = hot(source);
      const b = hot(notifier);
      expectObservable(a[buffer]({ delay: () => b, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })).toEqual(
        a[window](b)[mergeMap]((w) => w[buffer]({ emitEmpty: true, emitRemainingOnError: false }))
      );
    });
  });
});
