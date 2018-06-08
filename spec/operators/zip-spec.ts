import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { zip, mergeMap } from 'rxjs/operators';
import { queueScheduler, from, of, Observable } from 'rxjs';

declare const type: Function;

/** @test {zip} */
describe('zip operator', () => {
  it('should combine a source with a second', () => {
    const a =    hot('---1---2---3---');
    const asubs =    '^';
    const b =    hot('--4--5--6--7--8--');
    const bsubs =    '^';
    const expected = '---x---y---z';

    expectObservable(a.pipe(zip(b)))
      .toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should zip the provided observables', (done) => {
    const expected = ['a1', 'b2', 'c3'];
    let i = 0;

    from(['a', 'b', 'c']).pipe(zip(
      from([1, 2, 3]),
      (a, b): string => a + b
    ))
    .subscribe(function (x) {
      expect(x).to.equal(expected[i++]);
    }, null, done);
  });

  it('should end once one observable completes and its buffer is empty', () => {
    const e1 =   hot('---a--b--c--|               ');
    const e1subs =   '^           !               ';
    const e2 =   hot('------d----e----f--------|  ');
    const e2subs =   '^                 !         ';
    const e3 =   hot('--------h----i----j---------'); // doesn't complete
    const e3subs =   '^                 !         ';
    const expected = '--------x----y----(z|)      '; // e1 complete and buffer empty
    const values = {
      x: ['a', 'd', 'h'],
      y: ['b', 'e', 'i'],
      z: ['c', 'f', 'j']
    };

    expectObservable(e1.pipe(zip(e2, e3))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should end once one observable nexts and zips value from completed other ' +
  'observable whose buffer is empty', () => {
    const e1 =   hot('---a--b--c--|             ');
    const e1subs =   '^           !             ';
    const e2 =   hot('------d----e----f|        ');
    const e2subs =   '^                !        ';
    const e3 =   hot('--------h----i----j-------'); // doesn't complete
    const e3subs =   '^                 !       ';
    const expected = '--------x----y----(z|)    '; // e2 buffer empty and signaled complete
    const values = {
      x: ['a', 'd', 'h'],
      y: ['b', 'e', 'i'],
      z: ['c', 'f', 'j']
    };

    expectObservable(e1.pipe(zip(e2, e3))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  describe('with iterables', () => {
    it('should zip them with values', () => {
      const myIterator = <any>{
        count: 0,
        next: function () {
          return { value: this.count++, done: false };
        }
      };
      myIterator[Symbol.iterator] = function () { return this; };

      const e1 =   hot('---a---b---c---d---|');
      const e1subs =   '^                  !';
      const expected = '---w---x---y---z---|';

      const values = {
        w: ['a', 0],
        x: ['b', 1],
        y: ['c', 2],
        z: ['d', 3]
      };

      expectObservable(e1.pipe(zip(myIterator))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

    it('should only call `next` as needed', () => {
      let nextCalled = 0;
      const myIterator = <any>{
        count: 0,
        next: function () {
          nextCalled++;
          return { value: this.count++, done: false };
        }
      };
      myIterator[Symbol.iterator] = function () { return this; };

      of(1, 2, 3).pipe(zip(myIterator))
        .subscribe();

      // since zip will call `next()` in advance, total calls when
      // zipped with 3 other values should be 4.
      expect(nextCalled).to.equal(4);
    });

    it('should work with never observable and empty iterable', () => {
      const a = cold(  '-');
      const asubs =    '^';
      const b: string[] = [];
      const expected = '-';

      expectObservable(a.pipe(zip(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with empty observable and empty iterable', () => {
      const a = cold('|');
      const asubs = '(^!)';
      const b: string[] = [];
      const expected = '|';

      expectObservable(a.pipe(zip(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with empty observable and non-empty iterable', () => {
      const a = cold('|');
      const asubs = '(^!)';
      const b = [1];
      const expected = '|';

      expectObservable(a.pipe(zip(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty observable and empty iterable', () => {
      const a = hot('---^----a--|');
      const asubs =    '^       !';
      const b: string[] = [];
      const expected = '--------|';

      expectObservable(a.pipe(zip(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with never observable and non-empty iterable', () => {
      const a = cold('-');
      const asubs = '^';
      const b = [1];
      const expected = '-';

      expectObservable(a.pipe(zip(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty observable and non-empty iterable', () => {
      const a = hot('---^----1--|');
      const asubs =    '^    !   ';
      const b = [2];
      const expected = '-----(x|)';

      expectObservable(a.pipe(zip(b))).toBe(expected, { x: ['1', 2] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty observable and empty iterable', () => {
      const a = hot('---^----#');
      const asubs =    '^    !';
      const b: string[] = [];
      const expected = '-----#';

      expectObservable(a.pipe(zip(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with observable which raises error and non-empty iterable', () => {
      const a = hot('---^----#');
      const asubs =    '^    !';
      const b = [1];
      const expected = '-----#';

      expectObservable(a.pipe(zip(b))).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty many observable and non-empty many iterable', () => {
      const a = hot('---^--1--2--3--|');
      const asubs =    '^        !   ';
      const b = [4, 5, 6];
      const expected = '---x--y--(z|)';

      expectObservable(a.pipe(zip(b))).toBe(expected,
        { x: ['1', 4], y: ['2', 5], z: ['3', 6] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty observable and non-empty iterable selector that throws', () => {
      const a = hot('---^--1--2--3--|');
      const asubs =    '^     !';
      const b = [4, 5, 6];
      const expected = '---x--#';

      const selector = function (x: string, y: number) {
        if (y === 5) {
          throw new Error('too bad');
        } else {
          return x + y;
        }};
      expectObservable(a.pipe(zip(b, selector))).toBe(expected,
        { x: '14' }, new Error('too bad'));
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });

  it('should combine two observables and selector', () => {
    const a =    hot('---1---2---3---');
    const asubs =    '^';
    const b =    hot('--4--5--6--7--8--');
    const bsubs =    '^';
    const expected = '---x---y---z';

    expectObservable(a.pipe(zip(b, function (e1, e2) { return e1 + e2; })))
      .toBe(expected, { x: '14', y: '25', z: '36' });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with n-ary symmetric', () => {
    const a = hot('---1-^-1----4----|');
    const asubs =      '^         !  ';
    const b = hot('---1-^--2--5----| ');
    const bsubs =      '^         !  ';
    const c = hot('---1-^---3---6-|  ');
    const expected =   '----x---y-|  ';

    expectObservable(a.pipe(zip(b, c))).toBe(expected,
      { x: ['1', '2', '3'], y: ['4', '5', '6'] });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with n-ary symmetric selector', () => {
    const a = hot('---1-^-1----4----|');
    const asubs =      '^         !  ';
    const b = hot('---1-^--2--5----| ');
    const bsubs =      '^         !  ';
    const c = hot('---1-^---3---6-|  ');
    const expected =   '----x---y-|  ';

    const observable = a.pipe(zip(b, c,
      function (r0, r1, r2) { return [r0, r1, r2]; }));
    expectObservable(observable).toBe(expected,
      { x: ['1', '2', '3'], y: ['4', '5', '6'] });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with n-ary symmetric array selector', () => {
    const a = hot('---1-^-1----4----|');
    const asubs =      '^         !  ';
    const b = hot('---1-^--2--5----| ');
    const bsubs =      '^         !  ';
    const c = hot('---1-^---3---6-|  ');
    const expected =   '----x---y-|  ';

    const observable = a.pipe(zip(b, c,
      function (r0, r1, r2) { return [r0, r1, r2]; }));
    expectObservable(observable).toBe(expected,
      { x: ['1', '2', '3'], y: ['4', '5', '6'] });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with some data asymmetric 1', () => {
    const a = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
    const asubs =      '^                 !    ';
    const b = hot('---1-^--2--4--6--8--0--|    ');
    const bsubs =      '^                 !    ';
    const expected =   '---a--b--c--d--e--|    ';

    expectObservable(a.pipe(zip(b, function (r1, r2) { return r1 + r2; })))
      .toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with some data asymmetric 2', () => {
    const a = hot('---1-^--2--4--6--8--0--|    ');
    const asubs =      '^                 !    ';
    const b = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
    const bsubs =      '^                 !    ';
    const expected =   '---a--b--c--d--e--|    ';

    expectObservable(a.pipe(zip(b, function (r1, r2) { return r1 + r2; })))
      .toBe(expected, { a: '21', b: '43', c: '65', d: '87', e: '09' });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with some data symmetric', () => {
    const a = hot('---1-^-1-3-5-7-9------| ');
    const asubs =      '^                ! ';
    const b = hot('---1-^--2--4--6--8--0--|');
    const bsubs =      '^                ! ';
    const expected =   '---a--b--c--d--e-| ';

    expectObservable(a.pipe(zip(b, function (r1, r2) { return r1 + r2; })))
      .toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with selector throws', () => {
    const a = hot('---1-^-2---4----|  ');
    const asubs =      '^       !     ';
    const b = hot('---1-^--3----5----|');
    const bsubs =      '^       !     ';
    const expected =   '---x----#     ';

    const selector = function (x: string, y: string) {
      if (y === '5') {
        throw new Error('too bad');
      } else {
        return x + y;
      }};
    const observable = a.pipe(zip(b, selector));
    expectObservable(observable).toBe(expected,
      { x: '23' }, new Error('too bad'));
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with right completes first', () => {
    const a = hot('---1-^-2-----|');
    const asubs =      '^     !';
    const b = hot('---1-^--3--|');
    const bsubs =      '^     !';
    const expected =   '---x--|';

    expectObservable(a.pipe(zip(b))).toBe(expected, { x: ['2', '3'] });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with two nevers', () => {
    const a = cold(  '-');
    const asubs =    '^';
    const b = cold(  '-');
    const bsubs =    '^';
    const expected = '-';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with never and empty', () => {
    const a = cold(  '-');
    const asubs =    '(^!)';
    const b = cold(  '|');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with empty and never', () => {
    const a = cold(  '|');
    const asubs =    '(^!)';
    const b = cold(  '-');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with empty and empty', () => {
    const a = cold(  '|');
    const asubs =    '(^!)';
    const b = cold(  '|');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with empty and non-empty', () => {
    const a = cold(  '|');
    const asubs =    '(^!)';
    const b = hot(   '---1--|');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with non-empty and empty', () => {
    const a = hot(   '---1--|');
    const asubs =    '(^!)';
    const b = cold(  '|');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with never and non-empty', () => {
    const a = cold(  '-');
    const asubs =    '^';
    const b = hot(   '---1--|');
    const bsubs =    '^     !';
    const expected = '-';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with non-empty and never', () => {
    const a = hot(   '---1--|');
    const asubs =    '^     !';
    const b = cold(  '-');
    const bsubs =    '^';
    const expected = '-';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with empty and error', () => {
    const a = cold(  '|');
    const asubs =    '(^!)';
    const b = hot(   '------#', null, 'too bad');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error and empty', () => {
    const a = hot(   '------#', null, 'too bad');
    const asubs =    '(^!)';
    const b = cold(  '|');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error', () => {
    const a =    hot('----------|');
    const asubs =    '^     !    ';
    const b =    hot('------#    ');
    const bsubs =    '^     !    ';
    const expected = '------#    ';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with never and error', () => {
    const a = cold(  '-');
    const asubs =    '^     !';
    const b =    hot('------#');
    const bsubs =    '^     !';
    const expected = '------#';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error and never', () => {
    const a =    hot('------#');
    const asubs =    '^     !';
    const b = cold(  '-');
    const bsubs =    '^     !';
    const expected = '------#';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error and error', () => {
    const a =    hot('------#', null, 'too bad');
    const asubs =    '^     !';
    const b =    hot('----------#', null, 'too bad 2');
    const bsubs =    '^     !';
    const expected = '------#';

    expectObservable(a.pipe(zip(b))).toBe(expected, null, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with two sources that eventually raise errors', () => {
    const a =    hot('--w-----#----', { w: 1 }, 'too bad');
    const asubs =    '^       !';
    const b =    hot('-----z-----#-', { z: 2 }, 'too bad 2');
    const bsubs =    '^       !';
    const expected = '-----x--#';

    expectObservable(a.pipe(zip(b))).toBe(expected, { x: [1, 2] }, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with two sources that eventually raise errors (swapped)', () => {
    const a =    hot('-----z-----#-', { z: 2 }, 'too bad 2');
    const asubs =    '^       !';
    const b =    hot('--w-----#----', { w: 1 }, 'too bad');
    const bsubs =    '^       !';
    const expected = '-----x--#';

    expectObservable(a.pipe(zip(b))).toBe(expected, { x: [2, 1] }, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error and some', () => {
    const a = cold(  '#');
    const asubs =    '(^!)';
    const b = hot(   '--1--2--3--');
    const bsubs =    '(^!)';
    const expected = '#';

    expectObservable(a.pipe(zip(b))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should combine an immediately-scheduled source with an immediately-scheduled second', (done) => {
    const a = of<number>(1, 2, 3, queueScheduler);
    const b = of<number>(4, 5, 6, 7, 8, queueScheduler);
    const r = [[1, 4], [2, 5], [3, 6]];
    let i = 0;

    a.pipe(zip(b)).subscribe(function (vals) {
      expect(vals).to.deep.equal(r[i++]);
    }, null, done);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const a =    hot('---1---2---3---|');
    const unsub =    '         !';
    const asubs =    '^        !';
    const b =    hot('--4--5--6--7--8--|');
    const bsubs =    '^        !';
    const expected = '---x---y--';

    const r = a.pipe(
      mergeMap((x) => of(x)),
      zip(b),
      mergeMap((x) => of(x))
    );

    expectObservable(r, unsub).toBe(expected, { x: ['1', '4'], y: ['2', '5']});
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  type('should support rest parameter observables', () => {
    /* tslint:disable:no-unused-variable */
    let o: Observable<number>;
    let z: Observable<number>[];
    let a: Observable<number[]> = o.pipe(zip(...z));
    /* tslint:enable:no-unused-variable */
  });

  type('should support projected rest parameter observables', () => {
    /* tslint:disable:no-unused-variable */
    let o: Observable<number>;
    let z: Observable<number>[];
    let a: Observable<string[]> = o.pipe(zip(...z, (...r) => r.map(v => v.toString())));
    /* tslint:enable:no-unused-variable */
  });

  type('should support projected arrays of observables', () => {
    /* tslint:disable:no-unused-variable */
    let o: Observable<number>;
    let z: Observable<number>[];
    let a: Observable<string[]> = o.pipe(zip(z, (...r: any[]) => r.map(v => v.toString())));
    /* tslint:enable:no-unused-variable */
  });
});
