/** @prettier */
import { expect } from 'chai';
import { max, mergeMap, skip, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, range } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {max} */
describe('max', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should find the max of values of an observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|   ', { a: 42, b: -1, c: 3 });
      const e1subs = '  ^----------!   ';
      const expected = '-----------(x|)';

      expectObservable(e1.pipe(max())).toBe(expected, { x: 42 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should be never when source is never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(max())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should be zero when source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      expectObservable(e1.pipe(max())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it("should be never when source doesn't complete", () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--x--^--y--');
      const e1subs = '     ^-----';
      const expected = '   ------';

      expectObservable(e1.pipe(max())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it("should complete when source doesn't have values", () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^---|');
      const e1subs = '   ^---!';
      const expected = ' ----|';

      expectObservable(e1.pipe(max())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should max the unique value of an observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--|   ', { y: 42 });
      const e1subs = '   ^-----!   ';
      const expected = ' ------(w|)';

      expectObservable(e1.pipe(max())).toBe(expected, { w: 42 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should max the values of an ongoing hot observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--|   ', { a: 42, b: -1, c: 0, d: 6 });
      const e1subs = '    ^----------!   ';
      const expected = '  -----------(x|)';

      expectObservable(e1.pipe(max())).toBe(expected, { x: 6 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|', { a: 42, b: -1, c: 0 });
      const e1subs = '  ^-----!     ';
      const expected = '-------     ';
      const unsub = '   ------!     ';

      expectObservable(e1.pipe(max()), unsub).toBe(expected, { x: 42 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|', { a: 42, b: -1, c: 0 });
      const e1subs = '  ^-----!     ';
      const expected = '-------     ';
      const unsub = '   ------!     ';

      const result = e1.pipe(
        mergeMap((x: number) => of(x)),
        max(),
        mergeMap((x: number) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, { x: 42 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should max a range() source observable', (done) => {
    range(1, 10000)
      .pipe(max())
      .subscribe(
        (value: number) => {
          expect(value).to.equal(10000);
        },
        () => {
          done(new Error('should not be called'));
        },
        () => {
          done();
        }
      );
  });

  it('should max a range().pipe(skip(1)) source observable', (done) => {
    range(1, 10)
      .pipe(skip(1), max())
      .subscribe(
        (value: number) => {
          expect(value).to.equal(10);
        },
        () => {
          done(new Error('should not be called'));
        },
        () => {
          done();
        }
      );
  });

  it('should max a range().pipe(take(1)) source observable', (done) => {
    range(1, 10)
      .pipe(take(1), max())
      .subscribe(
        (value: number) => {
          expect(value).to.equal(1);
        },
        () => {
          done(new Error('should not be called'));
        },
        () => {
          done();
        }
      );
  });

  it('should work with error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
      const e1subs = '   ^--------!';
      const expected = ' ---------#';

      expectObservable(e1.pipe(max())).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with throw', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(max())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a constant predicate on an empty hot observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^---|');
      const e1subs = '   ^---!';
      const expected = ' ----|';

      const predicate = function <T>() {
        return 42;
      };

      expectObservable(e1.pipe(max(predicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a constant predicate on an never hot observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^----');
      const e1subs = '   ^----';
      const expected = ' -----';

      const predicate = function <T>() {
        return 42;
      };

      expectObservable(e1.pipe(max(predicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a constant predicate on a simple hot observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^-a-|   ', { a: 1 });
      const e1subs = '   ^---!   ';
      const expected = ' ----(w|)';

      const predicate = function () {
        return 42;
      };

      expectObservable(e1.pipe(max(predicate))).toBe(expected, { w: 1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a reverse predicate on observable with many values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^-b--c--d-|   ', { a: 42, b: -1, c: 0, d: 666 });
      const e1subs = '   ^---------!   ';
      const expected = ' ----------(w|)';

      const predicate = function <T>(x: T, y: T) {
        return x > y ? -1 : 1;
      };

      expectObservable(e1.pipe(max(predicate))).toBe(expected, { w: -1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a predicate for string on observable with many values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^-b--c--d-|   ');
      const e1subs = '   ^---------!   ';
      const expected = ' ----------(w|)';

      const predicate = function <T>(x: T, y: T) {
        return x > y ? -1 : 1;
      };

      expectObservable(e1.pipe(max(predicate))).toBe(expected, { w: 'b' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a constant predicate on observable that throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^---#');
      const e1subs = '   ^---!';
      const expected = ' ----#';

      const predicate = () => {
        return 42;
      };

      expectObservable(e1.pipe(max(predicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a predicate that throws, on observable with many values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^-2--3--|');
      const e1subs = '   ^----!   ';
      const expected = ' -----#   ';

      const predicate = function (x: string, y: string) {
        if (y === '3') {
          throw 'error';
        }
        return x > y ? -1 : 1;
      };

      expectObservable(e1.pipe(max(predicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
