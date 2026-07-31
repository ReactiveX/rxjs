// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/zip-legacy-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { map } from 'rxjs/map';
import { zipWith } from 'rxjs/zip-with';
describe('zip-legacy (cold)', () => {
  it('should work with selector throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-2---4----|  ');
      const asubs = '     ^-------!     ';
      const b = hot('---1-^--3----5----|');
      const bsubs = '     ^-------!     ';
      const expected = '  ---x----#     ';
      const selector = (x, y) => {
        if (y === '5') {
          throw new Error('too bad');
        } else {
          return x + y;
        }
      };
      const observable = a[zipWith](b)[map]((values) => selector(...values));
      expectObservable(observable).toBe(expected, { x: '23' }, new Error('too bad'));
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with some data asymmetric 1', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
      const asubs = '     ^-----------------!    ';
      const b = hot('---1-^--2--4--6--8--0--|    ');
      const bsubs = '     ^-----------------!    ';
      const expected = '  ---a--b--c--d--e--|    ';
      expectObservable(
        a[zipWith](b)[map]((values) =>
          ((r1, r2) => {
            return r1 + r2;
          })(...values)
        )
      ).toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with some data asymmetric 2', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^--2--4--6--8--0--|    ');
      const asubs = '     ^-----------------!    ';
      const b = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
      const bsubs = '     ^-----------------!    ';
      const expected = '  ---a--b--c--d--e--|    ';
      expectObservable(
        a[zipWith](b)[map]((values) =>
          ((r1, r2) => {
            return r1 + r2;
          })(...values)
        )
      ).toBe(expected, { a: '21', b: '43', c: '65', d: '87', e: '09' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with some data symmetric', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1-3-5-7-9------| ');
      const asubs = '     ^----------------! ';
      const b = hot('---1-^--2--4--6--8--0--|');
      const bsubs = '     ^----------------! ';
      const expected = '  ---a--b--c--d--e-| ';
      expectObservable(
        a[zipWith](b)[map]((values) =>
          ((r1, r2) => {
            return r1 + r2;
          })(...values)
        )
      ).toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with n-ary symmetric selector', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1----4----|');
      const asubs = '     ^---------!  ';
      const b = hot('---1-^--2--5----| ');
      const bsubs = '     ^---------!  ';
      const c = hot('---1-^---3---6-|  ');
      const expected = '  ----x---y-|  ';
      const observable = a[zipWith](b, c)[map]((values) =>
        ((r0, r1, r2) => {
          return [r0, r1, r2];
        })(...values)
      );
      expectObservable(observable).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should work with n-ary symmetric array selector', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---1-^-1----4----|');
      const asubs = '     ^---------!  ';
      const b = hot('---1-^--2--5----| ');
      const bsubs = '     ^---------!  ';
      const c = hot('---1-^---3---6-|  ');
      const expected = '  ----x---y-|  ';
      const observable = a[zipWith](b, c)[map]((values) =>
        ((r0, r1, r2) => {
          return [r0, r1, r2];
        })(...values)
      );
      expectObservable(observable).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
  it('should combine two observables and selector', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   ---1---2---3---');
      const asubs = '^-----------------!';
      const b = hot('   --4--5--6--7--8--');
      const bsubs = '^-----------------!';
      const expected = '---x---y---z';
      expectObservable(
        a[zipWith](b)[map]((values) =>
          ((e1, e2) => {
            return e1 + e2;
          })(...values)
        ),
        '^-----------------!'
      ).toBe(expected, { x: '14', y: '25', z: '36' });
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
  });
});
