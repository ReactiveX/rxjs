import { expect } from 'chai';
import { Subject, of } from 'rxjs';
import { bufferCount, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

declare function asDiagram(arg: string): Function;

/** @test {bufferCount} */
describe('bufferCount operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  asDiagram('bufferCount(3,2)')('should emit buffers at intervals', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const values = {
        v: ['a', 'b', 'c'],
        w: ['c', 'd', 'e'],
        x: ['e', 'f', 'g'],
        y: ['g', 'h', 'i'],
        z: ['i']
      };
      const e1 = hot('  --a--b--c--d--e--f--g--h--i--|');
      const expected = '--------v-----w-----x-----y--(z|)';

      expectObservable(e1.pipe(bufferCount(3, 2))).toBe(expected, values);
    });
  });

  it('should emit buffers at buffersize of intervals if not specified', () => {
    testScheduler.run(({ hot, expectObservable }) => {
        const values = {
        x: ['a', 'b'],
        y: ['c', 'd'],
        z: ['e', 'f']
      };
      const e1 = hot('  --a--b--c--d--e--f--|');
      const expected = '-----x-----y-----z--|';

      expectObservable(e1.pipe(bufferCount(2))).toBe(expected, values);
    });
  });

  it('should buffer properly (issue #2062)', () => {
    const item$ = new Subject<number>();
    const results: any[] = [];
    item$.pipe(
      bufferCount(3, 1)
    ).subscribe(value => {
        results.push(value);

        if (value.join() === '1,2,3') {
          item$.next(4);
        }
      });

    item$.next(1);
    item$.next(2);
    item$.next(3);

    expect(results).to.deep.equal([[1, 2, 3], [2, 3, 4]]);
  });

  it('should emit partial buffers if source completes before reaching specified buffer count', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const e1 = hot('  --a--b--c--d--|');
      const expected = '--------------(x|)';

      expectObservable(e1.pipe(bufferCount(5))).toBe(expected, {x: ['a', 'b', 'c', 'd']});
    });
  });

  it('should emit full buffer then last partial buffer if source completes', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a^-b--c--d--e--|');
      const e1subs = '     ^-------------!';
      const expected = '   --------y-----(z|)';

      expectObservable(e1.pipe(bufferCount(3))).toBe(expected, {y: ['b', 'c', 'd'], z: ['e']});
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit buffers at intervals, but stop when result is unsubscribed early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        v: ['a', 'b', 'c'],
        w: ['c', 'd', 'e']
      };
      const e1 = hot('  --a--b--c--d--e--f--g--h--i--|');
      const unsub = '   ------------------!           ';
      const subs = '    ^-----------------!           ';
      const expected = '--------v-----w----           ';

      expectObservable(e1.pipe(bufferCount(3, 2)), unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        v: ['a', 'b', 'c'],
        w: ['c', 'd', 'e']
      };
      const e1 = hot('  --a--b--c--d--e--f--g--h--i--|');
      const subs = '    ^-----------------!           ';
      const expected = '--------v-----w----           ';
      const unsub = '   ------------------!           ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        bufferCount(3, 2),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should raise error if source raise error before reaching specified buffer count', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--#');
      const e1subs = '  ^-------------!';
      const expected = '--------------#';

      expectObservable(e1.pipe(bufferCount(5))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit buffers with specified skip count when skip count is less than window count', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        v: ['a', 'b', 'c'],
        w: ['b', 'c', 'd'],
        x: ['c', 'd', 'e'],
        y: ['d', 'e'],
        z: ['e']
      };
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^----------------!';
      const expected = '--------v--w--x--(yz|)';

      expectObservable(e1.pipe(bufferCount(3, 1))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit buffers with specified skip count when skip count is more than window count', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
    const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^----------------!';
      const expected = '-----y--------z--|';
      const values = {
        y: ['a', 'b'],
        z: ['d', 'e']
      };

      expectObservable(e1.pipe(bufferCount(2, 3))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
