import { buffer, mergeMap, take } from 'rxjs/operators';
import { EMPTY, NEVER, throwError, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

declare function asDiagram(arg: string): Function;

/** @test {buffer} */
describe('Observable.prototype.buffer', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  asDiagram('buffer')('should emit buffers that close and reopen', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const a = hot('   -a-b-c-d-e-f-g-h-i-|');
      const b = hot('   -----B-----B-----B-|');
      const expected = '-----x-----y-----z-|';
      const expectedValues = {
        x: ['a', 'b', 'c'],
        y: ['d', 'e', 'f'],
        z: ['g', 'h', 'i']
      };
      expectObservable(a.pipe(buffer(b))).toBe(expected, expectedValues);
    });
  });

  it('should work with empty and empty selector', () => {
    testScheduler.run(({ expectObservable }) => {
      const a = EMPTY;
      const b = EMPTY;
      const expected = '|';
      expectObservable(a.pipe(buffer(b))).toBe(expected);
    });
  });

  it('should work with empty and non-empty selector', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const a = EMPTY;
      const b = hot('-----a-----');
      const expected = '|';
      expectObservable(a.pipe(buffer(b))).toBe(expected);
    });
  });

  it('should work with non-empty and empty selector', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const b = EMPTY;
      const expected = '|';
      expectObservable(a.pipe(buffer(b))).toBe(expected);
    });
  });

  it('should work with never and never selector', () => {
    testScheduler.run(({ expectObservable }) => {
      const a = NEVER;
      const b = NEVER;
      const expected = '-';
      expectObservable(a.pipe(buffer(b))).toBe(expected);
    });
  });

  it('should work with never and empty selector', () => {
    testScheduler.run(({ expectObservable }) => {
      const a = NEVER;
      const b = EMPTY;
      const expected = '|';
      expectObservable(a.pipe(buffer(b))).toBe(expected);
    });
  });

  it('should work with empty and never selector', () => {
    testScheduler.run(({ expectObservable }) => {
      const a = EMPTY;
      const b = NEVER;
      const expected = '|';
      expectObservable(a.pipe(buffer(b))).toBe(expected);
    });
  });

  it('should work with non-empty and throw selector', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const a = hot('---^--a--');
      const b = throwError(new Error('too bad'));
      const expected = '#';
      expectObservable(a.pipe(buffer(b))).toBe(expected, null, new Error('too bad'));
    });
  });

  it('should work with throw and non-empty selector', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const a = throwError(new Error('too bad'));
      const b = hot('---^--a--');
      const expected = '#';
      expectObservable(a.pipe(buffer(b))).toBe(expected, null, new Error('too bad'));
    });
  });

  it('should work with error', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const a = hot('---^-------#', undefined, new Error('too bad'));
      const b = hot('---^--------');
      const expected = '--------#';
      expectObservable(a.pipe(buffer(b))).toBe(expected, null, new Error('too bad'));
    });
  });

  it('should work with error and non-empty selector', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const a = hot('---^-------#', undefined, new Error('too bad'));
      const b = hot('---^---a----');
      const expected = '----a---#';
      expectObservable(a.pipe(buffer(b))).toBe(expected, { a: [] }, new Error('too bad'));
    });
  });

  it('should work with selector', () => {
    // Buffer Boundaries Simple (RxJS 4)
    testScheduler.run(({ hot, expectObservable }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const b = hot('--------^--a-------b---cd---------e---f---|');
      const expected = '     ---a-------b---cd---------e---f-|';
      const expectedValues = {
        a: ['3'],
        b: ['4', '5'],
        c: ['6'],
        d: [] as string[],
        e: ['7', '8', '9'],
        f: ['0']
      };
      expectObservable(a.pipe(buffer(b))).toBe(expected, expectedValues);
    });
  });

  it(' work with selector completed', () => {
    // Buffshoulder Boundaries onCompletedBoundaries (RxJS 4)
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const subs = '         ^----------------!               ';
      const b = hot('--------^--a-------b---cd|               ');
      const expected = '     ---a-------b---cd|               ';
      const expectedValues = {
        a: ['3'],
        b: ['4', '5'],
        c: ['6'],
        d: [] as string[]
      };
      expectObservable(a.pipe(buffer(b))).toBe(expected, expectedValues);
      expectSubscriptions(a.subscriptions).toBe(subs);
    });
  });

  it('should allow unsubscribing the result Observable early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const unsub = '        --------------!                  ';
      const subs = '         ^-------------!                  ';
      const b = hot('--------^--a-------b---cd|               ');
      const expected = '     ---a-------b---                  ';
      const expectedValues = {
        a: ['3'],
        b: ['4', '5']
      };
      expectObservable(a.pipe(buffer(b)), unsub).toBe(expected, expectedValues);
      expectSubscriptions(a.subscriptions).toBe(subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const subs = '         ^-------------!                  ';
      const b = hot('--------^--a-------b---cd|               ');
      const expected = '     ---a-------b---                  ';
      const unsub = '        --------------!                  ';
      const expectedValues = {
        a: ['3'],
        b: ['4', '5']
      };

      const result = a.pipe(
        mergeMap((x: any) => of(x)),
        buffer(b),
        mergeMap((x: any) => of(x)),
      );

      expectObservable(result, unsub).toBe(expected, expectedValues);
      expectSubscriptions(a.subscriptions).toBe(subs);
    });
  });

  it('should work with non-empty and selector error', () => {
    // Buffer Boundaries onErrorSource (RxJS 4)
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('--1--2--^--3-----#', {'3': 3}, new Error('too bad'));
      const subs = '         ^--------!';
      const b = hot('--------^--a--b---');
      const expected = '     ---a--b--#';
      const expectedValues = {
        a: [3],
        b: [] as string[]
      };
      expectObservable(a.pipe(buffer(b))).toBe(expected, expectedValues, new Error('too bad'));
      expectSubscriptions(a.subscriptions).toBe(subs);
    });
  });

  it('should work with non-empty and empty selector error', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const b = hot('--------^----------------#', undefined, new Error('too bad'));
      const expected = '     -----------------#';
      expectObservable(a.pipe(buffer(b))).toBe(expected, null, new Error('too bad'));
    });
  });

  it('should work with non-empty and selector error', () => {
    // Buffer Boundaries onErrorBoundaries (RxJS 4)
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const obj = { a: true, b: true, c: true };
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const subs = '         ^----------------!';
      const b = hot('--------^--a-------b---c-#', obj, new Error('too bad'));
      const expected = '     ---a-------b---c-#';
      const expectedValues = {
        a: ['3'],
        b: ['4', '5'],
        c: ['6']
      };
      expectObservable(a.pipe(buffer(b))).toBe(expected, expectedValues, new Error('too bad'));
      expectSubscriptions(a.subscriptions).toBe(subs);
    });
  });

  it('should unsubscribe notifier when source unsubscribed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
      const unsub = '        --------------!                  ';
      const subs = '         ^-------------!                  ';
      const b = hot('--------^--a-------b---cd|               ');
      const bsubs = '        ^-------------!                  ';
      const expected = '     ---a-------b---                  ';
      const expectedValues = {
        a: ['3'],
        b: ['4', '5']
      };

      expectObservable(a.pipe(buffer(b)), unsub).toBe(expected, expectedValues);
      expectSubscriptions(a.subscriptions).toBe(subs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should unsubscribe notifier when source unsubscribed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   -a-b-c-d-e-f-g-h-i-|');
      const b = hot('   -----1-----2-----3-|');
      const bsubs = '   ^----!';
      const expected = '-----(x|)';
      const expectedValues = {
        x: ['a', 'b', 'c'],
      };

      expectObservable(a.pipe(buffer(b), take(1))).toBe(expected, expectedValues);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
});
