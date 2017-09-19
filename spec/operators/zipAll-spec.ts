import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const Symbol: any;
const Observable = Rx.Observable;
const queueScheduler = Rx.Scheduler.queue;

/** @test {zipAll} */
describe('Observable.prototype.zipAll', () => {
  asDiagram('zipAll')('should combine paired events from two observables', () => {
    const x =    cold(               '-a-----b-|');
    const y =    cold(               '--1-2-----');
    const outer = hot('-x----y--------|         ', { x: x, y: y });
    const expected =  '-----------------A----B-|';

    const result = outer.zipAll((a: string, b: string) => String(a) + String(b));

    expectObservable(result).toBe(expected, { A: 'a1', B: 'b2' });
  });

  it('should combine two observables', () => {
    const a =    hot('---1---2---3---');
    const asubs =    '^';
    const b =    hot('--4--5--6--7--8--');
    const bsubs =    '^';
    const expected = '---x---y---z';
    const values = { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] };

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected, values);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should take all observables from the source and zip them', (done: MochaDone) => {
    const expected = ['a1', 'b2', 'c3'];
    let i = 0;
    Observable.of<any>(
      Observable.of<any>('a', 'b', 'c'),
      Observable.of<any>(1, 2, 3)
    )
    .zipAll((a: any, b: any) => a + b)
    .subscribe((x: any) => {
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

    expectObservable(Observable.of<any>(e1, e2, e3).zipAll()).toBe(expected, values);
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

    expectObservable(Observable.of<any>(e1, e2, e3).zipAll()).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  describe('with iterables', () => {
    it('should zip them with values', () => {
      const myIterator = {
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

      expectObservable(Observable.of<any>(e1, myIterator).zipAll()).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

    it('should only call `next` as needed', () => {
      let nextCalled = 0;
      const myIterator = {
        count: 0,
        next: function () {
          nextCalled++;
          return { value: this.count++, done: false };
        }
      };
      myIterator[Symbol.iterator] = function () { return this; };

      Observable.of<any>(Observable.of<any>(1, 2, 3), myIterator).zipAll()
        .subscribe();

      // since zip will call `next()` in advance, total calls when
      // zipped with 3 other values should be 4.
      expect(nextCalled).to.equal(4);
    });

    it('should work with never observable and empty iterable', () => {
      const a = cold(  '-');
      const asubs =    '^';
      const b = [];
      const expected = '-';

      expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with empty observable and empty iterable', () => {
      const a = cold('|');
      const asubs = '(^!)';
      const b = [];
      const expected = '|';

      expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with empty observable and non-empty iterable', () => {
      const a = cold('|');
      const asubs = '(^!)';
      const b = [1];
      const expected = '|';

      expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty observable and empty iterable', () => {
      const a = hot('---^----a--|');
      const asubs =    '^       !';
      const b = [];
      const expected = '--------|';

      expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with never observable and non-empty iterable', () => {
      const a = cold('-');
      const asubs = '^';
      const b = [1];
      const expected = '-';

      expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty observable and non-empty iterable', () => {
      const a = hot('---^----1--|');
      const asubs =    '^    !   ';
      const b = [2];
      const expected = '-----(x|)';

      expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected, { x: ['1', 2] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty observable and empty iterable', () => {
      const a = hot('---^----#');
      const asubs =    '^    !';
      const b = [];
      const expected = '-----#';

      expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with observable which raises error and non-empty iterable', () => {
      const a = hot('---^----#');
      const asubs =    '^    !';
      const b = [1];
      const expected = '-----#';

      expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty many observable and non-empty many iterable', () => {
      const a = hot('---^--1--2--3--|');
      const asubs =    '^        !   ';
      const b = [4, 5, 6];
      const expected = '---x--y--(z|)';

      expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected,
        { x: ['1', 4], y: ['2', 5], z: ['3', 6] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty observable and non-empty iterable selector that throws', () => {
      const a = hot('---^--1--2--3--|');
      const asubs =    '^     !';
      const b = [4, 5, 6];
      const expected = '---x--#';

      const selector = function (x, y) {
        if (y === 5) {
          throw new Error('too bad');
        } else {
          return x + y;
        }};
      expectObservable(Observable.of<any>(a, b).zipAll(selector)).toBe(expected,
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

    expectObservable(Observable.of<any>(a, b).zipAll((e1: string, e2: string) => e1 + e2))
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

    expectObservable(Observable.of<any>(a, b, c).zipAll()).toBe(expected,
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

    const observable = Observable.of<any>(a, b, c).zipAll((r0, r1, r2) => [r0, r1, r2]);
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

    const observable = Observable.of<any>(a, b, c).zipAll((r0, r1, r2) => [r0, r1, r2]);
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

    expectObservable(Observable.of<any>(a, b).zipAll((r1: string, r2: string) => r1 + r2))
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

    expectObservable(Observable.of<any>(a, b).zipAll((r1: string, r2: string) => r1 + r2))
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

    expectObservable(Observable.of<any>(a, b).zipAll((r1: string, r2: string) => r1 + r2))
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

    const selector = function (x, y) {
      if (y === '5') {
        throw new Error('too bad');
      } else {
        return x + y;
      }};
    const observable = Observable.of<any>(a, b).zipAll(selector);
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

    expectObservable(Observable.zip(a, b)).toBe(expected, { x: ['2', '3'] });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should zip until one child terminates', (done: MochaDone) => {
    const expected = ['a1', 'b2'];
    let i = 0;
    Observable.of<any>(
      Observable.of<any>('a', 'b', 'c'),
      Observable.of<any>(1, 2)
    )
    .zipAll((a: any, b: any) => a + b)
    .subscribe((x: any) => {
      expect(x).to.equal(expected[i++]);
    }, null, done);
  });

  it('should handle a hot observable of observables', () => {
    const x = cold(     'a---b---c---|      ');
    const xsubs =     '        ^           !';
    const y = cold(        'd---e---f---|   ');
    const ysubs =     '        ^           !';
    const e1 =    hot('--x--y--|            ', { x: x, y: y });
    const e1subs =    '^                   !';
    const expected =  '--------u---v---w---|';
    const values = {
      u: ['a', 'd'],
      v: ['b', 'e'],
      w: ['c', 'f']
    };

    expectObservable(e1.zipAll()).toBe(expected, values);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle merging a hot observable of non-overlapped observables', () => {
    const x = cold(    'a-b---------|                         ');
    const xsubs =    '                           ^           !';
    const y = cold(           'c-d-e-f-|                      ');
    const ysubs =    '                           ^       !    ';
    const z = cold(                    'g-h-i-j-k-|           ');
    const zsubs =    '                           ^         !  ';
    const e1 =   hot('--x------y--------z--------|            ', { x: x, y: y, z: z });
    const e1subs =   '^                                      !';
    const expected = '---------------------------u-v---------|';
    const values = {
      u: ['a', 'c', 'g'],
      v: ['b', 'd', 'h']
    };

    expectObservable(e1.zipAll()).toBe(expected, values);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if inner observable raises error', () => {
    const x = cold(       'a-b---------|                     ');
    const xsubs =    '                              ^       !';
    const y = cold(                 'c-d-e-f-#               ');
    const ysubs =    '                              ^       !';
    const z = cold(                          'g-h-i-j-k-|    ');
    const zsubs =    '                              ^       !';
    const e1 =   hot('--x---------y--------z--------|', { x: x, y: y, z: z });
    const e1subs =   '^                                     !';
    const expected = '------------------------------u-v-----#';

    const expectedValues = {
      u: ['a', 'c', 'g'],
      v: ['b', 'd', 'h']
    };

    expectObservable(e1.zipAll()).toBe(expected, expectedValues);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if outer observable raises error', () => {
    const y = cold(       'a-b---------|');
    const z = cold(                 'c-d-e-f-|');
    const e1 =   hot('--y---------z---#', { y: y, z: z });
    const e1subs =   '^               !';
    const expected = '----------------#';

    expectObservable(e1.zipAll()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with two nevers', () => {
    const a = cold(  '-');
    const asubs =    '^';
    const b = cold(  '-');
    const bsubs =    '^';
    const expected = '-';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with never and empty', () => {
    const a = cold(  '-');
    const asubs =    '(^!)';
    const b = cold(  '|');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with empty and never', () => {
    const a = cold(  '|');
    const asubs =    '(^!)';
    const b = cold(  '-');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with empty and empty', () => {
    const a = cold(  '|');
    const asubs =    '(^!)';
    const b = cold(  '|');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with empty and non-empty', () => {
    const a = cold(  '|');
    const asubs =    '(^!)';
    const b = hot(   '---1--|');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with non-empty and empty', () => {
    const a = hot(   '---1--|');
    const asubs =    '(^!)';
    const b = cold(  '|');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with never and non-empty', () => {
    const a = cold(  '-');
    const asubs =    '^';
    const b = hot(   '---1--|');
    const bsubs =    '^     !';
    const expected = '-';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with non-empty and never', () => {
    const a = hot(   '---1--|');
    const asubs =    '^     !';
    const b = cold(  '-');
    const bsubs =    '^';
    const expected = '-';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should combine a source with a second', () => {
    const a =    hot('---1---2---3---');
    const asubs =    '^';
    const b =    hot('--4--5--6--7--8--');
    const bsubs =    '^';
    const expected = '---x---y---z';

    expectObservable(Observable.of<any>(a, b).zipAll())
      .toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with empty and error', () => {
    const a = cold(  '|');
    const asubs =    '(^!)';
    const b = hot(   '------#', null, 'too bad');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error and empty', () => {
    const a = hot(   '------#', null, 'too bad');
    const asubs =    '(^!)';
    const b = cold(  '|');
    const bsubs =    '(^!)';
    const expected = '|';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error', () => {
    const a =    hot('----------|');
    const asubs =    '^     !    ';
    const b =    hot('------#    ');
    const bsubs =    '^     !    ';
    const expected = '------#    ';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with never and error', () => {
    const a = cold(  '-');
    const asubs =    '^     !';
    const b =    hot('------#');
    const bsubs =    '^     !';
    const expected = '------#';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error and never', () => {
    const a =    hot('------#');
    const asubs =    '^     !';
    const b = cold(  '-');
    const bsubs =    '^     !';
    const expected = '------#';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error and error', () => {
    const a =    hot('------#', null, 'too bad');
    const asubs =    '^     !';
    const b =    hot('----------#', null, 'too bad 2');
    const bsubs =    '^     !';
    const expected = '------#';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected, null, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with two sources that eventually raise errors', () => {
    const a =    hot('--w-----#----', { w: 1 }, 'too bad');
    const asubs =    '^       !';
    const b =    hot('-----z-----#-', { z: 2 }, 'too bad 2');
    const bsubs =    '^       !';
    const expected = '-----x--#';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected, { x: [1, 2] }, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with two sources that eventually raise errors (swapped)', () => {
    const a =    hot('-----z-----#-', { z: 2 }, 'too bad 2');
    const asubs =    '^       !';
    const b =    hot('--w-----#----', { w: 1 }, 'too bad');
    const bsubs =    '^       !';
    const expected = '-----x--#';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected, { x: [2, 1] }, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error and some', () => {
    const a = cold(  '#');
    const asubs =    '(^!)';
    const b = hot(   '--1--2--3--');
    const bsubs =    '(^!)';
    const expected = '#';

    expectObservable(Observable.of<any>(a, b).zipAll()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should combine two immediately-scheduled observables', (done: MochaDone) => {
    const a = Observable.of<any>(1, 2, 3, queueScheduler);
    const b = Observable.of<any>(4, 5, 6, 7, 8, queueScheduler);
    const r = [[1, 4], [2, 5], [3, 6]];
    let i = 0;

    const result = Observable.of<any>(a, b, queueScheduler).zipAll();

    result.subscribe((vals: any) => {
      expect(vals).to.deep.equal(r[i++]);
    }, null, done);
  });

  it('should combine a source with an immediately-scheduled source', (done: MochaDone) => {
    const a = Observable.of<any>(1, 2, 3, queueScheduler);
    const b = Observable.of<any>(4, 5, 6, 7, 8);
    const r = [[1, 4], [2, 5], [3, 6]];
    let i = 0;

    const result = Observable.of<any>(a, b, queueScheduler).zipAll();

    result.subscribe((vals: any) => {
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
    const values = { x: ['1', '4'], y: ['2', '5']};

    const r = Observable.of<any>(a, b)
      .mergeMap((x: string) => Observable.of(x))
      .zipAll()
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(r, unsub).toBe(expected, values);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should complete when empty source', () => {
    const source = hot('|');
    const expected =   '|';

    expectObservable(source.zipAll()).toBe(expected);
  });
});
