import { expect } from 'chai';
import { zipAll, mergeMap } from 'rxjs/operators';
import { queueScheduler, of, zip } from 'rxjs';
import { TestScheduler } from 'rxjs/internal/testing/TestScheduler';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';
import { fromScheduled } from 'rxjs/internal/create/fromScheduled';

/** @test {zipAll} */
describe('zipAll operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('zipAll')
  it('should combine paired events from two observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =    cold(               '-a-----b-|');
      const y =    cold(               '--1-2-----');
      const outer = hot('-x----y--------|         ', { x: x, y: y });
      const expected =  '-----------------A----B-|';

      const result = outer.pipe(zipAll());

      expectObservable(result).toBe(expected, { A: ['a', '1'], B: ['b', '2'] });
    });
  });

  it('should combine two observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =    hot('---1---2---3---');
      const asubs =    '^';
      const b =    hot('--4--5--6--7--8--');
      const bsubs =    '^';
      const expected = '---x---y---z';
      const values = { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] };

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected, values);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should take all observables from the source and zip them', (done) => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const expected = [['a', 1], ['b', 2], ['c', 3]];
      let i = 0;
      const source = of(
        of('a', 'b', 'c'),
        of(1, 2, 3)
      ).pipe(zipAll())
      .subscribe((x) => {
        expect(x).to.deep.equal(expected[i++]);
      }, null, done);
    });
  });

  it('should end once one observable completes and its buffer is empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
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

      expectObservable(of(e1, e2, e3).pipe(zipAll())).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should end once one observable nexts and zips value from completed other ' +
  'observable whose buffer is empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
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

      expectObservable(of(e1, e2, e3).pipe(zipAll())).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should work with n-ary symmetric', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = hot('---1-^-1----4----|');
      const asubs =      '^         !  ';
      const b = hot('---1-^--2--5----| ');
      const bsubs =      '^         !  ';
      const c = hot('---1-^---3---6-|  ');
      const expected =   '----x---y-|  ';

      expectObservable(of(a, b, c).pipe(zipAll())).toBe(expected,
        { x: ['1', '2', '3'], y: ['4', '5', '6'] });
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with some data asymmetric 1', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
      const asubs =      '^                 !    ';
      const b = hot('---1-^--2--4--6--8--0--|    ');
      const bsubs =      '^                 !    ';
      const expected =   '---a--b--c--d--e--|    ';

      expectObservable(of(a, b).pipe(zipAll()))
        .toBe(expected, { a: ['1', '2'], b: ['3', '4'], c: ['5', '6'], d: ['7', '8'], e: ['9', '0'] });
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with some data asymmetric 2', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = hot('---1-^--2--4--6--8--0--|    ');
      const asubs =      '^                 !    ';
      const b = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
      const bsubs =      '^                 !    ';
      const expected =   '---a--b--c--d--e--|    ';

      expectObservable(of(a, b).pipe(zipAll()))
        .toBe(expected, { a: ['2', '1'], b: ['4', '3'], c: ['6', '5'], d: ['8', '7'], e: ['0', '9'] });
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with some data symmetric', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = hot('---1-^-1-3-5-7-9------| ');
      const asubs =      '^                ! ';
      const b = hot('---1-^--2--4--6--8--0--|');
      const bsubs =      '^                ! ';
      const expected =   '---a--b--c--d--e-| ';

      expectObservable(of(a, b).pipe(zipAll()))
        .toBe(expected, { a: ['1', '2'], b: ['3', '4'], c: ['5', '6'], d: ['7', '8'], e: ['9', '0'] });
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with right completes first', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = hot('---1-^-2-----|');
      const asubs =      '^     !';
      const b = hot('---1-^--3--|');
      const bsubs =      '^     !';
      const expected =   '---x--|';

      expectObservable(zip(a, b)).toBe(expected, { x: ['2', '3'] });
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should zip until one child terminates', (done) => {
    const expected = [['a', 1], ['b', 2]];
    let i = 0;
    of(
      of('a', 'b', 'c'),
      of(1, 2)
    )
    .pipe(zipAll())
    .subscribe((x) => {
      expect(x).to.deep.equal(expected[i++]);
    }, null, done);
  });

  it('should handle a hot observable of observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(     'a---b---c---|      ');
      const xsubs =     '        ^           !';
      const y = cold(        'd---e---f---|   ');
      const ysubs =     '        ^           !';
      const e1 =    hot('--x--y--|            ', { x: x, y: y });
      const e1subs =    '^       !            ';
      const expected =  '--------u---v---w---|';
      const values = {
        u: ['a', 'd'],
        v: ['b', 'e'],
        w: ['c', 'f']
      };

      expectObservable(e1.pipe(zipAll())).toBe(expected, values);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle merging a hot observable of non-overlapped observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(    'a-b---------|                         ');
      const xsubs =    '                           ^           !';
      const y = cold(           'c-d-e-f-|                      ');
      const ysubs =    '                           ^       !    ';
      const z = cold(                    'g-h-i-j-k-|           ');
      const zsubs =    '                           ^         !  ';
      const e1 =   hot('--x------y--------z--------|            ', { x: x, y: y, z: z });
      const e1subs =   '^                          !            ';
      const expected = '---------------------------u-v---------|';
      const values = {
        u: ['a', 'c', 'g'],
        v: ['b', 'd', 'h']
      };

      expectObservable(e1.pipe(zipAll())).toBe(expected, values);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(z).toBe(zsubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error if inner observable raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(       'a-b---------|                     ');
      const xsubs =    '                              ^       !';
      const y = cold(                 'c-d-e-f-#               ');
      const ysubs =    '                              ^       !';
      const z = cold(                          'g-h-i-j-k-|    ');
      const zsubs =    '                              ^       !';
      const e1 =   hot('--x---------y--------z--------|        ', { x: x, y: y, z: z });
      const e1subs =   '^                             !        ';
      const expected = '------------------------------u-v-----#';

      const expectedValues = {
        u: ['a', 'c', 'g'],
        v: ['b', 'd', 'h']
      };

      expectObservable(e1.pipe(zipAll())).toBe(expected, expectedValues);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(z).toBe(zsubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error if outer observable raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const y = cold(       'a-b---------|');
      const z = cold(                 'c-d-e-f-|');
      const e1 =   hot('--y---------z---#', { y: y, z: z });
      const e1subs =   '^               !';
      const expected = '----------------#';

      expectObservable(e1.pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should work with two nevers', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = cold(  '-');
      const asubs =    '^';
      const b = cold(  '-');
      const bsubs =    '^';
      const expected = '-';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with never and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = cold(  '-');
      const asubs =    '(^!)';
      const b = cold(  '|');
      const bsubs =    '(^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with empty and never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = cold(  '|');
      const asubs =    '(^!)';
      const b = cold(  '-');
      const bsubs =    '(^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with empty and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = cold(  '|');
      const asubs =    '(^!)';
      const b = cold(  '|');
      const bsubs =    '(^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with empty and non-empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = cold(  '|');
      const asubs =    '(^!)';
      const b = hot(   '---1--|');
      const bsubs =    '(^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with non-empty and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = hot(   '---1--|');
      const asubs =    '(^!)';
      const b = cold(  '|');
      const bsubs =    '(^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with never and non-empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = cold(  '-');
      const asubs =    '^';
      const b = hot(   '---1--|');
      const bsubs =    '^     !';
      const expected = '-';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with non-empty and never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = hot(   '---1--|');
      const asubs =    '^     !';
      const b = cold(  '-');
      const bsubs =    '^';
      const expected = '-';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should combine a source with a second', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =    hot('---1---2---3---');
      const asubs =    '^';
      const b =    hot('--4--5--6--7--8--');
      const bsubs =    '^';
      const expected = '---x---y---z';

      expectObservable(of(a, b).pipe(zipAll()))
        .toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with empty and error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = cold(  '|');
      const asubs =    '(^!)';
      const b = hot(   '------#', null, 'too bad');
      const bsubs =    '(^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with error and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = hot(   '------#', null, 'too bad');
      const asubs =    '(^!)';
      const b = cold(  '|');
      const bsubs =    '(^!)';
      const expected = '|';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =    hot('----------|');
      const asubs =    '^     !    ';
      const b =    hot('------#    ');
      const bsubs =    '^     !    ';
      const expected = '------#    ';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with never and error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = cold(  '-');
      const asubs =    '^     !';
      const b =    hot('------#');
      const bsubs =    '^     !';
      const expected = '------#';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with error and never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =    hot('------#');
      const asubs =    '^     !';
      const b = cold(  '-');
      const bsubs =    '^     !';
      const expected = '------#';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with error and error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =    hot('------#', null, 'too bad');
      const asubs =    '^     !';
      const b =    hot('----------#', null, 'too bad 2');
      const bsubs =    '^     !';
      const expected = '------#';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected, null, 'too bad');
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with two sources that eventually raise errors', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =    hot('--w-----#----', { w: 1 }, 'too bad');
      const asubs =    '^       !';
      const b =    hot('-----z-----#-', { z: 2 }, 'too bad 2');
      const bsubs =    '^       !';
      const expected = '-----x--#';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected, { x: [1, 2] }, 'too bad');
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with two sources that eventually raise errors (swapped)', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =    hot('-----z-----#-', { z: 2 }, 'too bad 2');
      const asubs =    '^       !';
      const b =    hot('--w-----#----', { w: 1 }, 'too bad');
      const bsubs =    '^       !';
      const expected = '-----x--#';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected, { x: [2, 1] }, 'too bad');
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should work with error and some', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a = cold(  '#');
      const asubs =    '(^!)';
      const b = hot(   '--1--2--3--');
      const bsubs =    '(^!)';
      const expected = '#';

      expectObservable(of(a, b).pipe(zipAll())).toBe(expected);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should combine two immediately-scheduled observables', done => {
    const a = fromScheduled([1, 2, 3], queueScheduler);
    const b = fromScheduled([4, 5, 6, 7, 8], queueScheduler);
    const r = [[1, 4], [2, 5], [3, 6]];
    let i = 0;

    const result = fromScheduled([a, b], queueScheduler).pipe(zipAll());

    result.subscribe((vals) => {
      expect(vals).to.deep.equal(r[i++]);
    }, null, done);
  });

  it('should combine a source with an immediately-scheduled source', done => {
    const a = fromScheduled([1, 2, 3], queueScheduler);
    const b = of(4, 5, 6, 7, 8);
    const r = [[1, 4], [2, 5], [3, 6]];
    let i = 0;

    const result = fromScheduled([a, b], queueScheduler).pipe(zipAll());

    result.subscribe((vals) => {
      expect(vals).to.deep.equal(r[i++]);
    }, null, done);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =    hot('---1---2---3---|');
      const unsub =    '         !';
      const asubs =    '^        !';
      const b =    hot('--4--5--6--7--8--|');
      const bsubs =    '^        !';
      const expected = '---x---y--';
      const values = { x: ['1', '4'], y: ['2', '5']};

      const r = of(a, b).pipe(
        mergeMap((x) => of(x)),
        zipAll(),
        mergeMap((x) => of(x))
      );

      expectObservable(r, unsub).toBe(expected, values);
      expectSubscriptionsTo(a).toBe(asubs);
      expectSubscriptionsTo(b).toBe(bsubs);
    });
  });

  it('should complete when empty source', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('|');
      const expected =   '|';

      expectObservable(source.pipe(zipAll())).toBe(expected);
    });
  });
});
