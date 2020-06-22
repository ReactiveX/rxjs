import { timer, NEVER, merge } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { mergeMap, take, concat } from 'rxjs/operators';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {timer} */
describe('timer', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(observableMatcher);
  });

  it('should create an observable emitting periodically', () => {
    rxTest.run(({ expectObservable }) => {
      const e1 = timer(6, 2, rxTest).pipe(
        take(4), // make it actually finite, so it can be rendered
        concat(NEVER) // but pretend it's infinite by not completing
      );
      const expected = '------a-b-c-d-';
      const values = {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
      };
      expectObservable(e1).toBe(expected, values);
    });
  });

  it('should schedule a value of 0 then complete', () => {
    rxTest.run(({ expectObservable }) => {
      const dueTime = 5; // -----|
      const expected = '    -----(x|)';

      const source = timer(dueTime, undefined, rxTest);
      expectObservable(source).toBe(expected, { x: 0 });
    });
  });

  it('should emit a single value immediately', () => {
    rxTest.run(({ expectObservable }) => {
      const dueTime = 0;
      const expected = '(x|)';

      const source = timer(dueTime, rxTest);
      expectObservable(source).toBe(expected, { x: 0 });
    });
  });

  it('should start after delay and periodically emit values', () => {
    rxTest.run(({ expectObservable }) => {
      const dueTime = 4; // ----|
      const period = 2; //       -|-|-|-|
      const expected = '    ----a-b-c-d-(e|)';

      const source = timer(dueTime, period, rxTest).pipe(take(5));
      const values = { a: 0, b: 1, c: 2, d: 3, e: 4 };
      expectObservable(source).toBe(expected, values);
    });
  });

  it('should start immediately and periodically emit values', () => {
    rxTest.run(({ expectObservable }) => {
      const dueTime = 0; //|
      const period = 3; //  --|--|--|--|
      const expected = '   a--b--c--d--(e|)';

      const source = timer(dueTime, period, rxTest).pipe(take(5));
      const values = { a: 0, b: 1, c: 2, d: 3, e: 4 };
      expectObservable(source).toBe(expected, values);
    });
  });

  it('should stop emiting values when subscription is done', () => {
    rxTest.run(({ expectObservable }) => {
      const dueTime = 0; //|
      const period = 3; //  --|--|--|--|
      const expected = '   a--b--c--d--e';
      const unsub = '      ^------------!';

      const source = timer(dueTime, period, rxTest);
      const values = { a: 0, b: 1, c: 2, d: 3, e: 4 };
      expectObservable(source, unsub).toBe(expected, values);
    });
  });

  it('should schedule a value at a specified Date', () => {
    rxTest.run(({ expectObservable }) => {
      const offset = 4; // ----|
      const expected = '   ----(a|)';

      const dueTime = new Date(rxTest.now() + offset);
      const source = timer(dueTime, undefined, rxTest);
      expectObservable(source).toBe(expected, { a: 0 });
    });
  });

  it('should start after delay and periodically emit values', () => {
    rxTest.run(({ expectObservable }) => {
      const offset = 4; // ----|
      const period = 2; //      -|-|-|-|
      const expected = '   ----a-b-c-d-(e|)';

      const dueTime = new Date(rxTest.now() + offset);
      const source = timer(dueTime, period, rxTest).pipe(take(5));
      const values = { a: 0, b: 1, c: 2, d: 3, e: 4 };
      expectObservable(source).toBe(expected, values);
    });
  });

  it('should still target the same date if a date is provided even for the ' + 'second subscription', () => {
    rxTest.run(({ cold, time, expectObservable }) => {
      const offset = time('----|    ');
      const t1 = cold('    a|       ');
      const t2 = cold('    --a|     ');
      const expected = '   ----(aa|)';

      const dueTime = new Date(rxTest.now() + offset);
      const source = timer(dueTime, undefined, rxTest);

      const testSource = merge(t1, t2).pipe(mergeMap(() => source));

      expectObservable(testSource).toBe(expected, { a: 0 });
    });
  });

  it('should accept Infinity as the first argument', () => {
    rxTest.run(({ expectObservable }) => {
      const source = timer(Infinity, undefined, rxTest);
      const expected = '------';
      expectObservable(source).toBe(expected);
    });
  });

  it('should accept Infinity as the second argument', () => {
    rxTest.run(({ expectObservable }) => {
      rxTest.maxFrames = 20;
      const source = timer(4, Infinity, rxTest);
      const expected = '----a-';
      expectObservable(source).toBe(expected, { a: 0 });
    });
  });

  it('should accept negative numbers as the second argument, which should cause immediate completion', () => {
    rxTest.run(({ expectObservable }) => {
      const source = timer(4, -4, rxTest);
      const expected = '----(a|)';
      expectObservable(source).toBe(expected, { a: 0 });
    });
  });

  it('should accept 0 as the second argument', () => {
    rxTest.run(({ expectObservable }) => {
      const source = timer(4, 0, rxTest).pipe(take(5));
      const expected = '----(abcde|)';
      expectObservable(source).toBe(expected, { a: 0, b: 1, c: 2, d: 3, e: 4 });
    });
  });

  it('should emit after a delay of 0 for Date objects in the past', () => {
    rxTest.run(({ expectObservable }) => {
      const expected = '(a|)';
      const threeSecondsInThePast = new Date(rxTest.now() - 3000);
      const source = timer(threeSecondsInThePast, undefined, rxTest);
      expectObservable(source).toBe(expected, { a: 0 });
    });
  });
});
