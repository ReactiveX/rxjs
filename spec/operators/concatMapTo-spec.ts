import { expect } from 'chai';
import { of, from, Observable } from 'rxjs';
import { concatMapTo, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {concatMapTo} */
describe('concatMapTo', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should map-and-flatten each item to an Observable', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --1-----3--5-------|');
      const e1subs = '  ^------------------!';
      const e2 = cold(' x-x-x|              ', { x: 10 });
      const expected = '--x-x-x-x-x-xx-x-x-|';
      const values = { x: 10 };

      const result = e1.pipe(concatMapTo(e2));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should concatMapTo many outer values to many inner values', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---|                        ');
      const e1subs = '    ^----------------!                        ';
      const inner = cold('--i-j-k-l-|                               ', values);
      const innerSubs = [
        '                 -^---------!                              ',
        '                 -----------^---------!                    ',
        '                 ---------------------^---------!          ',
        '                 -------------------------------^---------!',
      ];
      const expected = '  ---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l-|';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should handle an empty source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const inner = cold('-1-2-3|');
      const innerSubs: string[] = [];
      const expected = '|';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should handle a never source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const inner = cold('-1-2-3|');
      const innerSubs: string[] = [];
      const expected = '-';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should error immediately if given a just-throw source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const inner = cold('-1-2-3|');
      const innerSubs: string[] = [];
      const expected = '#';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should return a silenced version of the source if the mapped inner is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('   --a-b--c-|');
      const e1subs = '    ^--------!';
      const inner = cold('|');
      // prettier-ignore
      const innerSubs = [
        '                 --(^!)     ',
        '                 ----(^!)   ',
        '                 -------(^!)',
      ];
      const expected = '  ---------|';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should return a never if the mapped inner is never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('   --a-b--c-|');
      const e1subs = '    ^--------!';
      const inner = cold('-');
      const innerSubs = ' --^       ';
      const expected = '  ----------';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should propagate errors if the mapped inner is a just-throw Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('   --a-b--c-|');
      const e1subs = '    ^-!       ';
      const inner = cold('#');
      const innerSubs = ' --(^!)    ';
      const expected = '  --#';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should concatMapTo many outer to many inner, complete late', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d----------------------------------|');
      const e1subs = '    ^-----------------------------------------------!';
      const inner = cold('--i-j-k-l-|                                      ', values);
      const innerSubs = [
        '                 -^---------!                                     ',
        '                 -----------^---------!                           ',
        '                 ---------------------^---------!                 ',
        '                 -------------------------------^---------!       ',
      ];
      const expected = '  ---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l--------|';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should concatMapTo many outer to many inner, outer never completes', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d-----------------------------------');
      const e1subs = '    ^------------------------------------------------';
      const inner = cold('--i-j-k-l-|                                      ', values);
      const innerSubs = [
        '                 -^---------!                                     ',
        '                 -----------^---------!                           ',
        '                 ---------------------^---------!                 ',
        '                 -------------------------------^---------!       ',
      ];
      const expected = '  ---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l---------';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---| ');
      const e1subs = '    ^----------------! ';
      const inner = cold('--i-j-k-l-|        ', values);
      // prettier-ignore
      const innerSubs = [
        '                 -^---------!       ',
        '                 -----------^------!',
      ];
      const expected = '  ---i-j-k-l---i-j-k-';
      const unsub = '     ------------------!';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        concatMapTo(inner),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should concatMapTo many outer to many inner, inner never completes', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---|');
      const e1subs = '    ^----------------!';
      const inner = cold('--i-j-k-l-        ', values);
      const innerSubs = ' -^                ';
      const expected = '  ---i-j-k-l--------';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should concatMapTo many outer to many inner, and inner throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---|');
      const e1subs = '    ^----------!      ';
      const inner = cold('--i-j-k-l-#       ', values);
      const innerSubs = ' -^---------!      ';
      const expected = '  ---i-j-k-l-#      ';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should concatMapTo many outer to many inner, and outer throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---#');
      const e1subs = '    ^----------------!';
      const inner = cold('--i-j-k-l-|       ', values);
      // prettier-ignore
      const innerSubs = [
        '                 -^---------!      ',
        '                 -----------^-----!',
      ];
      const expected = '  ---i-j-k-l---i-j-#';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should concatMapTo many outer to many inner, both inner and outer throw', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---#');
      const e1subs = '    ^----------!      ';
      const inner = cold('--i-j-k-l-#       ', values);
      const innerSubs = ' -^---------!      ';
      const expected = '  ---i-j-k-l-#      ';

      const result = e1.pipe(concatMapTo(inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner.subscriptions).toBe(innerSubs);
    });
  });

  it('should concatMapTo many outer to an array', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const expected = '(0123)(0123)---(0123)---(0123)--|';

      const result = e1.pipe(concatMapTo(['0', '1', '2', '3']));

      expectObservable(result).toBe(expected);
    });
  });

  it('should concatMapTo many outer to inner arrays, and outer throws', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const e1 = hot('  2-----4--------3--------2-------#');
      const expected = '(0123)(0123)---(0123)---(0123)--#';

      const result = e1.pipe(concatMapTo(['0', '1', '2', '3']));

      expectObservable(result).toBe(expected);
    });
  });

  it('should concatMapTo many outer to inner arrays, outer unsubscribed early', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const unsub = '   -------------!';
      const expected = '(0123)(0123)--';

      const result = e1.pipe(concatMapTo(['0', '1', '2', '3']));

      expectObservable(result, unsub).toBe(expected);
    });
  });

  it('should map values to constant resolved promises and concatenate', (done) => {
    const source = from([4, 3, 2, 1]);

    const results: number[] = [];
    source.pipe(concatMapTo(from(Promise.resolve(42)))).subscribe({
      next: (x) => {
        results.push(x);
      },
      error: (err) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      complete: () => {
        expect(results).to.deep.equal([42, 42, 42, 42]);
        done();
      },
    });
  });

  it('should map values to constant rejected promises and concatenate', (done) => {
    const source = from([4, 3, 2, 1]);

    source.pipe(concatMapTo(from(Promise.reject(42)))).subscribe({
      next: (x) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      error: (err) => {
        expect(err).to.equal(42);
        done();
      },
      complete: () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      },
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(concatMapTo(of(0)), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
