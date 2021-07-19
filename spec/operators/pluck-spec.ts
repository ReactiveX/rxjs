/** @prettier */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/internal/testing/TestScheduler';
import { pluck, map, mergeMap, take } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {pluck} */
describe('pluck', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should dematerialize an Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const inputs = {
        a: '{v:1}',
        b: '{v:2}',
        c: '{v:3}',
      };

      const e1 = cold(' --a--b--c--|', inputs);
      const e1subs = '  ^----------!';
      const expected = '--x--y--z--|';

      const result = e1.pipe(
        map((x) => ({ v: x.charAt(3) })),
        pluck('v')
      );

      expectObservable(result).toBe(expected, { x: '1', y: '2', z: '3' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work for one array', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const inputs = { x: ['abc'] };
      const e1 = cold(' --x--|', inputs);
      const e1subs = '  ^----!';
      const expected = '--y--|';

      const result = e1.pipe(pluck(0));

      expectObservable(result).toBe(expected, { y: 'abc' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work for one object', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const inputs = { x: { prop: 42 } };
      const e1 = cold(' --x--|', inputs);
      const e1subs = '  ^----!';
      const expected = '--y--|';

      const result = e1.pipe(pluck('prop'));

      expectObservable(result).toBe(expected, { y: 42 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work for multiple objects', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const inputs = {
        a: { prop: '1' },
        b: { prop: '2' },
        c: { prop: '3' },
        d: { prop: '4' },
        e: { prop: '5' },
      };
      const e1 = cold(' --a-b--c-d---e-|', inputs);
      const e1subs = '  ^--------------!';
      const expected = '--1-2--3-4---5-|';

      const result = e1.pipe(pluck('prop'));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with deep nested properties', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const inputs = {
        a: { a: { b: { c: '1' } } },
        b: { a: { b: { c: '2' } } },
        c: { a: { b: { c: '3' } } },
        d: { a: { b: { c: '4' } } },
        e: { a: { b: { c: '5' } } },
      };
      const e1 = cold(' --a-b--c-d---e-|', inputs);
      const e1subs = '  ^--------------!';
      const expected = '--1-2--3-4---5-|';

      const result = e1.pipe(pluck('a', 'b', 'c'));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with edge cases of deep nested properties', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const inputs = {
        a: { i: { j: { k: 1 } } },
        b: { i: { j: 2 } },
        c: { i: { k: { k: 3 } } },
        d: {},
        e: { i: { j: { k: 5 } } },
      };
      const e1 = cold(' --a-b--c-d---e-|', inputs);
      const e1subs = '  ^--------------!';
      const expected = '--v-w--x-y---z-|';
      const values: { [key: string]: number | undefined } = { v: 1, w: undefined, x: undefined, y: undefined, z: 5 };

      const result = e1.pipe(pluck('i', 'j', 'k'));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should throw an error if not property is passed', () => {
    expect(() => {
      of({ prop: 1 }, { prop: 2 }).pipe(pluck());
    }).to.throw(Error, 'list of properties cannot be empty.');
  });

  it('should propagate errors from observable that emits only errors', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      const result = e1.pipe(pluck('whatever'));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate errors from observable that emit values', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const inputs = { a: { prop: '1' }, b: { prop: '2' } };
      const e1 = cold(' --a--b--#', inputs, 'too bad');
      const e1subs = '  ^-------!';
      const expected = '--1--2--#';

      const result = e1.pipe(pluck('prop'));

      expectObservable(result).toBe(expected, undefined, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not pluck an empty observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      const result = e1.pipe(pluck('whatever'));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--b--c--|', { a: { prop: '1' }, b: { prop: '2' } });
      const e1subs = '  ^-----!     ';
      const expected = '--1--2-     ';
      const unsub = '   ------!     ';

      const result = e1.pipe(pluck('prop'));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should pluck twice', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const inputs = {
        a: { a: { b: { c: '1' } } },
        b: { a: { b: { c: '2' } } },
        c: { a: { b: { c: '3' } } },
        d: { a: { b: { c: '4' } } },
        e: { a: { b: { c: '5' } } },
      };
      const e1 = cold(' --a-b--c-d---e-|', inputs);
      const e1subs = '  ^--------------!';
      const expected = '--1-2--3-4---5-|';

      const result = e1.pipe(pluck('a', 'b'), pluck('c'));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const inputs = { a: { prop: '1' }, b: { prop: '2' } };
      const e1 = cold(' --a--b--c--|', inputs);
      const e1subs = '  ^-----!     ';
      const expected = '--1--2-     ';
      const unsub = '   ------!     ';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        pluck('prop'),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should support symbols', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const sym = Symbol('sym');
      const inputs = { x: { [sym]: 'abc' } };

      const e1 = cold(' --x--|', inputs);
      const e1subs = '  ^----!';
      const expected = '--y--|';

      const result = e1.pipe(pluck(sym));

      expectObservable(result).toBe(expected, { y: 'abc' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break on null values', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const inputs = { x: null };
      const e1 = cold(' --x--|', inputs);
      const e1subs = '  ^----!';
      const expected = '--y--|';

      const result = e1.pipe(pluck('prop'));

      expectObservable(result).toBe(expected, { y: undefined });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(pluck('whatever'), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
