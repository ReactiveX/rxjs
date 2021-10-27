/** @prettier */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { reduce, mergeMap } from 'rxjs/operators';
import { range, of } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {reduce} */
describe('reduce', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should reduce', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 1, b: 3, c: 5, x: 9 };
      const e1 = hot('  --a--b--c--|   ', values);
      const e1subs = '  ^----------!   ';
      const expected = '-----------(x|)';

      const result = e1.pipe(reduce((o, x) => o + x, 0));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should reduce with seed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|   ');
      const e1subs = '  ^-------!   ';
      const expected = '--------(x|)';

      const result = e1.pipe(reduce((o, x) => o + ' ' + x, 'n'));

      expectObservable(result).toBe(expected, { x: 'n a b' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should reduce with a seed of undefined', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|   ');
      const e1subs = '     ^--------------------!   ';
      const expected = '   ---------------------(x|)';

      const result = e1.pipe(reduce((o: string | undefined, x) => o + ' ' + x, undefined));

      expectObservable(result).toBe(expected, { x: 'undefined b c d e f g' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should reduce without a seed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|   ');
      const e1subs = '     ^--------------------!   ';
      const expected = '   ---------------------(x|)';

      const result = e1.pipe(reduce((o, x) => o + ' ' + x));

      expectObservable(result).toBe(expected, { x: 'b c d e f g' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should reduce with index without seed', () => {
    const idx = [1, 2, 3, 4, 5];

    range(0, 6)
      .pipe(
        reduce((acc, value, index) => {
          expect(idx.shift()).to.equal(index);
          return value;
        })
      )
      .subscribe({
        complete() {
          expect(idx).to.be.empty;
        },
      });
  });

  it('should reduce with index with seed', () => {
    const idx = [0, 1, 2, 3, 4, 5];

    range(0, 6)
      .pipe(
        reduce((acc, value, index) => {
          expect(idx.shift()).to.equal(index);
          return value;
        }, -1)
      )
      .subscribe({
        complete() {
          expect(idx).to.be.empty;
        },
      });
  });

  it('should reduce with seed if source is empty', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^-------|   ');
      const e1subs = '     ^-------!   ';
      const expected = '   --------(x|)';

      const result = e1.pipe(reduce((o, x) => o + x, '42'));

      expectObservable(result).toBe(expected, { x: '42' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if reduce function throws without seed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^----!   ';
      const expected = '-----#   ';

      const result = e1.pipe(
        reduce(() => {
          throw 'error';
        })
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^-----!  ';
      const expected = '-------  ';
      const unsub = '   ------!  ';

      const result = e1.pipe(reduce((o, x) => o + x));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^-----!  ';
      const expected = '-------  ';
      const unsub = '   ------!  ';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        reduce((o, x) => o + x),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source emits and raises error with seed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const e1subs = '  ^-------!';
      const expected = '--------#';

      const result = e1.pipe(reduce((o, x) => o + x, '42'));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source raises error with seed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----#');
      const e1subs = '  ^---!';
      const expected = '----#';

      const result = e1.pipe(reduce((o, x) => o + x, '42'));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if reduce function throws with seed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^-!      ';
      const expected = '--#      ';

      const result = e1.pipe(
        reduce(() => {
          throw 'error';
        }, 'n')
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete with seed if source emits but does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--');
      const e1subs = '  ^----';
      const expected = '-----';

      const result = e1.pipe(reduce((o, x) => o + x, 'n'));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete with seed if source never completes', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      const result = e1.pipe(reduce((o, x) => o + x, 'n'));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete without seed if source emits but does not completes', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--');
      const e1subs = '  ^-------';
      const expected = '--------';

      const result = e1.pipe(reduce((o, x) => o + x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete without seed if source never completes', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      const result = e1.pipe(reduce((o, x) => o + x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should reduce if source does not emit without seed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^-------|');
      const e1subs = '     ^-------!';
      const expected = '   --------|';

      const result = e1.pipe(reduce((o, x) => o + x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source emits and raises error without seed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const e1subs = '  ^-------!';
      const expected = '--------#';

      const result = e1.pipe(reduce((o, x) => o + x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source raises error without seed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----#');
      const e1subs = '  ^---!';
      const expected = '----#';

      const result = e1.pipe(reduce((o, x) => o + x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
