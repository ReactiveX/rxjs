import { expect } from 'chai';
import { zip } from 'rxjs/operators';
import { from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/**
 * zip legacy still supports a mapping function, but it's deprecated
 */
describe('zip legacy', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should zip the provided observables', done => {
    const expected = ['a1', 'b2', 'c3'];
    let i = 0;

    from(['a', 'b', 'c'])
      .pipe(zip(from([1, 2, 3]), (a, b): string => a + b))
      .subscribe(
        function(x) {
          expect(x).to.equal(expected[i++]);
        },
        null,
        done
      );
  });

  it('should work with selector throws', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-2---4----|  ');
      const asubs = '     ^-------!     ';
      const b = hot('---1-^--3----5----|');
      const bsubs = '     ^-------!     ';
      const expected = '  ---x----#     ';

      const selector = function(x: string, y: string) {
        if (y === '5') {
          throw new Error('too bad');
        } else {
          return x + y;
        }
      };
      const observable = a.pipe(zip(b, selector));
      expectObservable(observable).toBe(expected, { x: '23' }, new Error('too bad'));
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with some data asymmetric 1', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
      const asubs = '     ^-----------------!    ';
      const b = hot('---1-^--2--4--6--8--0--|    ');
      const bsubs = '     ^-----------------!    ';
      const expected = '  ---a--b--c--d--e--|    ';

      expectObservable(
        a.pipe(
          zip(b, function(r1, r2) {
            return r1 + r2;
          })
        )
      ).toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with some data asymmetric 2', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^--2--4--6--8--0--|    ');
      const asubs = '     ^-----------------!    ';
      const b = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
      const bsubs = '     ^-----------------!    ';
      const expected = '  ---a--b--c--d--e--|    ';

      expectObservable(
        a.pipe(
          zip(b, function(r1, r2) {
            return r1 + r2;
          })
        )
      ).toBe(expected, { a: '21', b: '43', c: '65', d: '87', e: '09' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with some data symmetric', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1-3-5-7-9------| ');
      const asubs = '     ^----------------! ';
      const b = hot('---1-^--2--4--6--8--0--|');
      const bsubs = '     ^----------------! ';
      const expected = '  ---a--b--c--d--e-| ';

      expectObservable(
        a.pipe(
          zip(b, function(r1, r2) {
            return r1 + r2;
          })
        )
      ).toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with n-ary symmetric selector', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1----4----|');
      const asubs = '     ^---------!  ';
      const b = hot('---1-^--2--5----| ');
      const bsubs = '     ^---------!  ';
      const c = hot('---1-^---3---6-|  ');
      const expected = '  ----x---y-|  ';

      const observable = a.pipe(
        zip(b, c, function(r0, r1, r2) {
          return [r0, r1, r2];
        })
      );
      expectObservable(observable).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should work with n-ary symmetric array selector', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1----4----|');
      const asubs = '     ^---------!  ';
      const b = hot('---1-^--2--5----| ');
      const bsubs = '     ^---------!  ';
      const c = hot('---1-^---3---6-|  ');
      const expected = '  ----x---y-|  ';

      const observable = a.pipe(
        zip(b, c, function(r0, r1, r2) {
          return [r0, r1, r2];
        })
      );
      expectObservable(observable).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });

  it('should combine two observables and selector', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---');
      const asubs = '   ^';
      const b = hot('   --4--5--6--7--8--');
      const bsubs = '   ^';
      const expected = '---x---y---z';

      expectObservable(
        a.pipe(
          zip(b, function(e1, e2) {
            return e1 + e2;
          })
        )
      ).toBe(expected, { x: '14', y: '25', z: '36' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
});
