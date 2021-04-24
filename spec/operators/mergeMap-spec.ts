/** @prettier */
import { expect } from 'chai';
import { mergeMap, map, delay, take } from 'rxjs/operators';
import { asapScheduler, defer, Observable, from, of, timer } from 'rxjs';
import { asInteropObservable } from '../helpers/interop-helper';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {mergeMap} */
describe('mergeMap', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should map-and-flatten each item to an Observable', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { x: 10, y: 30, z: 50 };
      const x = cold('    x-x-x|             ', values);
      //                        y-y-y|
      //                           z-z-z|
      const xsubs = [
        '               --^----!             ',
        '               --------^----!       ',
        '               -----------^----!    ',
      ];
      const e1 = hot('  --1-----3--5--------|');
      const e1subs = '  ^-------------------!';
      const expected = '--x-x-x-y-yzyz-z----|';

      const result = e1.pipe(mergeMap((value) => x.pipe(map((i) => i * +value))));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should support the deprecated resultSelector', () => {
    const results: Array<number[]> = [];

    of(1, 2, 3)
      .pipe(
        mergeMap(
          (x) => of(x, x + 1, x + 2),
          (a, b, i, ii) => [a, b, i, ii]
        )
      )
      .subscribe({
        next(value) {
          results.push(value);
        },
        error(err) {
          throw err;
        },
        complete() {
          expect(results).to.deep.equal([
            [1, 1, 0, 0],
            [1, 2, 0, 1],
            [1, 3, 0, 2],
            [2, 2, 1, 0],
            [2, 3, 1, 1],
            [2, 4, 1, 2],
            [3, 3, 2, 0],
            [3, 4, 2, 1],
            [3, 5, 2, 2],
          ]);
        },
      });
  });

  it('should support a void resultSelector (still deprecated)', () => {
    const results: number[] = [];

    of(1, 2, 3)
      .pipe(mergeMap((x) => of(x, x + 1, x + 2), void 0))
      .subscribe({
        next(value) {
          results.push(value);
        },
        error(err) {
          throw err;
        },
        complete() {
          expect(results).to.deep.equal([1, 2, 3, 2, 3, 4, 3, 4, 5]);
        },
      });
  });

  it('should support a void resultSelector (still deprecated) and concurrency limit', () => {
    const results: number[] = [];

    of(1, 2, 3)
      .pipe(mergeMap((x) => of(x, x + 1, x + 2), void 0, 1))
      .subscribe({
        next(value) {
          results.push(value);
        },
        error(err) {
          throw err;
        },
        complete() {
          expect(results).to.deep.equal([1, 2, 3, 2, 3, 4, 3, 4, 5]);
        },
      });
  });

  it('should mergeMap many regular interval inners', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold('  ----a---a---a---(a|)                    ');
      const asubs = '   ^---------------!                       ';
      const b = cold('      ----b---b---(b|)                    ');
      const bsubs = '   ----^-----------!                       ';
      const c = cold('                  ----c---c---c---c---(c|)');
      const csubs = '   ----------------^-------------------!   ';
      const d = cold('                          ----(d|)        ');
      const dsubs = '   ------------------------^---!           ';
      const e1 = hot('  a---b-----------c-------d-------|       ');
      const e1subs = '  ^-------------------------------!       ';
      const expected = '----a---(ab)(ab)(ab)c---c---(cd)c---(c|)';

      const observableLookup: Record<string, Observable<string>> = { a: a, b: b, c: c, d: d };
      const source = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(source).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map values to constant resolved promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = () => from(Promise.resolve(42));

    const results: number[] = [];
    source.pipe(mergeMap(project)).subscribe(
      (x) => {
        results.push(x);
      },
      (err) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      () => {
        expect(results).to.deep.equal([42, 42, 42, 42]);
        done();
      }
    );
  });

  it('should map values to constant rejected promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = () => from(Promise.reject<number>(42));

    source.pipe(mergeMap(project)).subscribe(
      (x) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      (err) => {
        expect(err).to.equal(42);
        done();
      },
      () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      }
    );
  });

  it('should map values to resolved promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = (value: number, index: number) => from(Promise.resolve(value + index));

    const results: number[] = [];
    source.pipe(mergeMap(project)).subscribe(
      (x) => {
        results.push(x);
      },
      (err) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      () => {
        expect(results).to.deep.equal([4, 4, 4, 4]);
        done();
      }
    );
  });

  it('should map values to rejected promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = (value: number, index: number) => from(Promise.reject<string>('' + value + '-' + index));

    source.pipe(mergeMap(project)).subscribe(
      (x) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      (err) => {
        expect(err).to.equal('4-0');
        done();
      },
      () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      }
    );
  });

  it('should mergeMap many outer values to many inner values', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                        ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l---|
      //                                         ----i---j---k---l---|
      const xsubs = [
        '               -^-------------------!                        ',
        '               ---------^-------------------!                ',
        '               -----------------^-------------------!        ',
        '               -------------------------^-------------------!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------|            ');
      const e1subs = '  ^--------------------------------!            ';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l---|';

      const result = e1.pipe(mergeMap(() => x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to many inner, complete late', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                            ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l---|
      //                                         ----i---j---k---l---|
      const xsubs = [
        '               -^-------------------!                            ',
        '               ---------^-------------------!                    ',
        '               -----------------^-------------------!            ',
        '               -------------------------^-------------------!    ',
      ];
      const e1 = hot('  -a-------b-------c-------d-----------------------|');
      const e1subs = '  ^------------------------------------------------!';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-------|';

      const result = e1.pipe(mergeMap(() => x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to many inner, outer never completes', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                                  ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l---|
      //                                         ----i---j---k---l---|
      //                                                 ----i---j---k---l---|
      //                                                                 ----i--
      const xsubs = [
        '               -^-------------------!                                  ',
        '               ---------^-------------------!                          ',
        '               -----------------^-------------------!                  ',
        '               -------------------------^-------------------!          ',
        '               ---------------------------------^-------------------!  ',
        '               -------------------------------------------------^-----!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------e---------------f------');
      const e1subs = '  ^------------------------------------------------------!';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i--';
      const unsub = '   -------------------------------------------------------!';

      const source = e1.pipe(mergeMap(() => x));

      expectObservable(source, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                                  ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l---|
      //                                         ----i---j---k---l---|
      //                                                 ----i---j---k---l---|
      //                                                                 ----i--
      const xsubs = [
        '               -^-------------------!                                  ',
        '               ---------^-------------------!                          ',
        '               -----------------^-------------------!                  ',
        '               -------------------------^-------------------!          ',
        '               ---------------------------------^-------------------!  ',
        '               -------------------------------------------------^-----!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------e---------------f------');
      const e1subs = '  ^------------------------------------------------------!';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i--';
      const unsub = '   -------------------------------------------------------!';

      const source = e1.pipe(
        map((x) => x),
        mergeMap(() => x),
        map((x) => x)
      );

      expectObservable(source, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains with interop inners when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^-----------!                ';
      const y = cold('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-!                ';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^--------------------!                ';
      const expected = '-----------a--b--c--d-                ';
      const unsub = '   ---------------------!                ';

      const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

      // This test manipulates the observable to make it look like an interop
      // observable - an observable from a foreign library. Interop subscribers
      // are treated differently: they are wrapped in a safe subscriber. This
      // test ensures that unsubscriptions are chained all the way to the
      // interop subscriber.

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        mergeMap((value) => asInteropObservable(observableLookup[value])),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to many inner, inner never completes', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l-------------------------');
      //                         ----i---j---k---l-----------------
      //                                 ----i---j---k---l---------
      //                                         ----i---j---k---l-
      const xsubs = [
        '               -^-----------------------------------------',
        '               ---------^---------------------------------',
        '               -----------------^-------------------------',
        '               -------------------------^-----------------',
      ];
      const e1 = hot('  -a-------b-------c-------d-------|         ');
      const e1subs = '  ^--------------------------------!         ';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-';

      const result = e1.pipe(mergeMap(() => x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to many inner, and inner throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l-------#   ');
      //                         ----i---j---k---l
      //                                 ----i---j
      //                                         -
      const xsubs = [
        '               -^-----------------------!   ',
        '               ---------^---------------!   ',
        '               -----------------^-------!   ',
        '               -------------------------(^!)',
      ];
      const e1 = hot('  -a-------b-------c-------d   ');
      const e1subs = '  ^------------------------!   ';
      const expected = '-----i---j---(ki)(lj)(ki)#   ';

      const result = e1.pipe(mergeMap(() => x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to many inner, and outer throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|            ');
      //                         ----i---j---k---l---|
      //                                 ----i---j---k---l
      //                                         ----i---j
      const xsubs = [
        '               -^-------------------!            ',
        '               ---------^-------------------!    ',
        '               -----------------^---------------!',
        '               -------------------------^-------!',
      ];
      const e1 = hot('  -a-------b-------c-------d-------#');
      const e1subs = '  ^--------------------------------!';
      const expected = '-----i---j---(ki)(lj)(ki)(lj)(ki)#';

      const result = e1.pipe(mergeMap(() => x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to many inner, both inner and outer throw', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---#            ');
      //                         ----i---j---k
      //                                 ----i
      const xsubs = [
        '               -^-------------------!            ',
        '               ---------^-----------!            ',
        '               -----------------^---!            ',
      ];
      const e1 = hot('  -a-------b-------c-------d-------#');
      const e1subs = '  ^--------------------!            ';
      const expected = '-----i---j---(ki)(lj)#            ';

      const result = e1.pipe(mergeMap(() => x));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=1', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                                        ');
      //                                     ----i---j---k---l---|
      //                                                         ----i---j---k---l---|
      const xsubs = [
        '               -^-------------------!                                        ',
        '               ---------------------^-------------------!                    ',
        '               -----------------------------------------^-------------------!',
      ];
      const e1 = hot('  -a-------b-------c---|                                        ');
      const e1subs = '  ^--------------------!                                        ';
      const expected = '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';

      const project = () => x;
      const result = e1.pipe(mergeMap(project, 1));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=2', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('   ----i---j---k---l---|                    ');
      //                         ----i---j---k---l---|
      //                                     ----i---j---k---l---|
      const xsubs = [
        '               -^-------------------!                    ',
        '               ---------^-------------------!            ',
        '               ---------------------^-------------------!',
      ];
      const e1 = hot('  -a-------b-------c---|                    ');
      const e1subs = '  ^--------------------!                    ';
      const expected = '-----i---j---(ki)(lj)k---(li)j---k---l---|';

      const project = () => x;
      const result = e1.pipe(mergeMap(project, 2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=1', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('   x----i---j---k---l---|                                        ');
      const asubs = '   -^-------------------!                                        ';
      const b = hot('   -x-x-xxxx-x-x-xxxxx-x----i---j---k---l---|                    ');
      const bsubs = '   ---------------------^-------------------!                    ';
      const c = hot('   x-xxxx---x-x-x-x-x-xx--x--x-x--x--xxxx-x-----i---j---k---l---|');
      const csubs = '   -----------------------------------------^-------------------!';
      const e1 = hot('  -a-------b-------c---|                                        ');
      const e1subs = '  ^--------------------!                                        ';
      const expected = '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';
      const inners: Record<string, Observable<string>> = { a: a, b: b, c: c };

      const project = (x: string) => inners[x];
      const result = e1.pipe(mergeMap(project, 1));

      expectObservable(result).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=2', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const x = hot('   x----i---j---k---l---|                    ');
      const xsubs = '   -^-------------------!                    ';
      const y = hot('   -x-x-xxxx----i---j---k---l---|            ');
      const ysubs = '   ---------^-------------------!            ';
      const z = hot('   x-xxxx---x-x-x-x-x-xx----i---j---k---l---|');
      const zsubs = '   ---------------------^-------------------!';
      const e1 = hot('  -a-------b-------c---|                    ');
      const e1subs = '  ^--------------------!                    ';
      const expected = '-----i---j---(ki)(lj)k---(li)j---k---l---|';
      const inners: Record<string, Observable<string>> = { a: x, b: y, c: z };

      const project = (x: string) => inners[x];
      const result = e1.pipe(mergeMap(project, 2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, where all inners are finite', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold(' -#                                                  ');
      const asubs: string[] = [];
      const b = cold('   -#                                                ');
      const bsubs: string[] = [];
      const c = cold('        -2--3--4--5------------------6-|             ');
      const csubs = '       --^------------------------------!             ';
      const d = cold('              -----------2--3|                       ');
      const dsubs = '       --------^--------------!                       ';
      const e = cold('                     -1--------2--3-----4--5--------|');
      const esubs = '       ---------------^------------------------------!';
      const f = cold('                                      --|            ');
      const fsubs = '       --------------------------------^-!            ';
      const g = cold('                                            ---1-2|  ');
      const gsubs = '       --------------------------------------^-----!  ';
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g|       ');
      const e1subs = '      ^--------------------------------------!       ';
      const expected = '    ---2--3--4--5---1--2--3--2--3--6--4--5---1-2--|';

      const observableLookup: Record<string, Observable<string>> = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

      const result = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, all inners finite except one', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold(' -#                                                  ');
      const asubs: string[] = [];
      const b = cold('   -#                                                ');
      const bsubs: string[] = [];
      const c = cold('        -2--3--4--5------------------6-|             ');
      const csubs = '       --^------------------------------!             ';
      const d = cold('              -----------2--3-                       ');
      const dsubs = '       --------^---------------                       ';
      const e = cold('                     -1--------2--3-----4--5--------|');
      const esubs = '       ---------------^------------------------------!';
      const f = cold('                                      --|            ');
      const fsubs = '       --------------------------------^-!            ';
      const g = cold('                                            ---1-2|  ');
      const gsubs = '       --------------------------------------^-----!  ';
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g|       ');
      const e1subs = '      ^--------------------------------------!       ';
      const expected = '    ---2--3--4--5---1--2--3--2--3--6--4--5---1-2---';

      const observableLookup: Record<string, Observable<string>> = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

      const result = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, inners finite, outer does not complete', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold(' -#                                                  ');
      const asubs: string[] = [];
      const b = cold('   -#                                                ');
      const bsubs: string[] = [];
      const c = cold('        -2--3--4--5------------------6-|             ');
      const csubs = '       --^------------------------------!             ';
      const d = cold('              -----------2--3|                       ');
      const dsubs = '       --------^--------------!                       ';
      const e = cold('                     -1--------2--3-----4--5--------|');
      const esubs = '       ---------------^------------------------------!';
      const f = cold('                                      --|            ');
      const fsubs = '       --------------------------------^-!            ';
      const g = cold('                                            ---1-2|  ');
      const gsubs = '       --------------------------------------^-----!  ';
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g--------');
      const e1subs = '      ^----------------------------------------------';
      const expected = '    ---2--3--4--5---1--2--3--2--3--6--4--5---1-2---';

      const observableLookup: Record<string, Observable<string>> = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

      const result = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, all inners finite, and outer throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold(' -#                                                  ');
      const asubs: string[] = [];
      const b = cold('   -#                                                ');
      const bsubs: string[] = [];
      const c = cold('        -2--3--4--5------------------6-|             ');
      const csubs = '       --^------------------------------!             ';
      const d = cold('              -----------2--3|                       ');
      const dsubs = '       --------^--------------!                       ';
      const e = cold('                     -1--------2--3-----4--5--------|');
      const esubs = '       ---------------^-----------------------!       ';
      const f = cold('                                      --|            ');
      const fsubs = '       --------------------------------^-!            ';
      const g = cold('                                            ---1-2|  ');
      const gsubs = '       --------------------------------------^!       ';
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g#       ');
      const e1subs = '      ^--------------------------------------!       ';
      const expected = '    ---2--3--4--5---1--2--3--2--3--6--4--5-#       ';

      const observableLookup: Record<string, Observable<string>> = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

      const result = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, all inners complete except one throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold(' -#                                                  ');
      const asubs: string[] = [];
      const b = cold('   -#                                                ');
      const bsubs: string[] = [];
      const c = cold('        -2--3--4--5------------------6-#             ');
      const csubs = '       --^------------------------------!             ';
      const d = cold('              -----------2--3|                       ');
      const dsubs = '       --------^--------------!                       ';
      const e = cold('                     -1--------2--3-----4--5--------|');
      const esubs = '       ---------------^-----------------!             ';
      const f = cold('                                      --|            ');
      const fsubs = '       --------------------------------^!             ';
      const g = cold('                                            ---1-2|  ');
      const gsubs: string[] = [];
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g|       ');
      const e1subs = '      ^--------------------------------!             ';
      const expected = '    ---2--3--4--5---1--2--3--2--3--6-#             ';

      const observableLookup: Record<string, Observable<string>> = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

      const result = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, all inners finite, outer is unsubscribed', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold(' -#                                                  ');
      const asubs: string[] = [];
      const b = cold('   -#                                                ');
      const bsubs: string[] = [];
      const c = cold('        -2--3--4--5------------------6-|             ');
      const csubs = '       --^---------------------------!                ';
      const d = cold('              -----------2--3|                       ');
      const dsubs = '       --------^--------------!                       ';
      const e = cold('                     -1--------2--3-----4--5--------|');
      const esubs = '       ---------------^--------------!                ';
      const f = cold('                                      --|            ');
      const fsubs: string[] = [];
      const g = cold('                                            ---1-2|  ');
      const gsubs: string[] = [];
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g|');
      const e1subs = '      ^-----------------------------!                ';
      const expected = '    ---2--3--4--5---1--2--3--2--3--                ';
      const unsub = '       ------------------------------!                ';

      const observableLookup: Record<string, Observable<string>> = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

      const source = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(source, unsub).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, all inners finite, project throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const a = cold(' -#                                                  ');
      const asubs: string[] = [];
      const b = cold('   -#                                                ');
      const bsubs: string[] = [];
      const c = cold('        -2--3--4--5------------------6-|             ');
      const csubs = '       --^------------!                               ';
      const d = cold('              -----------2--3|                       ');
      const dsubs = '       --------^------!                               ';
      const e = cold('                     -1--------2--3-----4--5--------|');
      const esubs: string[] = [];
      const f = cold('                                      --|            ');
      const fsubs: string[] = [];
      const g = cold('                                            ---1-2|  ');
      const gsubs: string[] = [];
      const e1 = hot('-a-b--^-c-----d------e----------------f-----g|       ');
      const e1subs = '      ^--------------!                               ';
      const expected = '    ---2--3--4--5--#                               ';

      const observableLookup: Record<string, Observable<string>> = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const source = e1.pipe(
        mergeMap((value) => {
          if (value === 'e') {
            throw 'error';
          }
          return observableLookup[value];
        })
      );

      expectObservable(source).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e.subscriptions).toBe(esubs);
      expectSubscriptions(f.subscriptions).toBe(fsubs);
      expectSubscriptions(g.subscriptions).toBe(gsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  function arrayRepeat<T>(value: T, times: number): T[] {
    const results: T[] = [];
    for (let i = 0; i < times; i++) {
      results.push(value);
    }
    return results;
  }

  it('should mergeMap many outer to an array for each value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^-------------------------------!';
      const expected = '(22)--(4444)---(333)----(22)----|';

      const source = e1.pipe(mergeMap((value) => arrayRepeat(value, +value)));

      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to inner arrays, and outer throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------#');
      const e1subs = '  ^-------------------------------!';
      const expected = '(22)--(4444)---(333)----(22)----#';

      const source = e1.pipe(mergeMap((value) => arrayRepeat(value, +value)));

      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to inner arrays, outer gets unsubscribed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^------------!                   ';
      const expected = '(22)--(4444)--                   ';
      const unsub = '   -------------!                   ';

      const source = e1.pipe(mergeMap((value) => arrayRepeat(value, +value)));

      expectObservable(source, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to inner arrays, project throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^--------------!                 ';
      const expected = '(22)--(4444)---#                 ';

      const source = e1.pipe(
        mergeMap((value) => {
          if (value === '3') {
            throw 'error';
          }
          return arrayRepeat(value, +value);
        })
      );

      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should map and flatten', () => {
    const source = of(1, 2, 3, 4).pipe(mergeMap((x) => of(x + '!')));

    const expected = ['1!', '2!', '3!', '4!'];
    let completed = false;

    source.subscribe(
      (x) => {
        expect(x).to.equal(expected.shift());
      },
      null,
      () => {
        expect(expected.length).to.equal(0);
        completed = true;
      }
    );

    expect(completed).to.be.true;
  });

  it('should map and flatten an Array', () => {
    const source = of(1, 2, 3, 4).pipe(mergeMap((x): any => [x + '!']));

    const expected = ['1!', '2!', '3!', '4!'];
    let completed = false;

    source.subscribe(
      (x) => {
        expect(x).to.equal(expected.shift());
      },
      null,
      () => {
        expect(expected.length).to.equal(0);
        completed = true;
      }
    );

    expect(completed).to.be.true;
  });

  it('should support nested merges', (done) => {
    // Added as a failing test when investigating:
    // https://github.com/ReactiveX/rxjs/issues/4071

    const results: (number | string)[] = [];

    of(1)
      .pipe(mergeMap(() => defer(() => of(2, asapScheduler)).pipe(mergeMap(() => defer(() => of(3, asapScheduler))))))
      .subscribe({
        next(value: any) {
          results.push(value);
        },
        complete() {
          results.push('done');
        },
      });

    setTimeout(() => {
      expect(results).to.deep.equal([3, 'done']);
      done();
    }, 0);
  });

  it('should support nested merges with promises', (done) => {
    // Added as a failing test when investigating:
    // https://github.com/ReactiveX/rxjs/issues/4071

    const results: (number | string)[] = [];

    of(1)
      .pipe(mergeMap(() => from(Promise.resolve(2)).pipe(mergeMap(() => Promise.resolve(3)))))
      .subscribe({
        next(value) {
          results.push(value);
        },
        complete() {
          results.push('done');
        },
      });

    setTimeout(() => {
      expect(results).to.deep.equal([3, 'done']);
      done();
    }, 0);
  });

  it('should support wrapped sources', (done) => {
    // Added as a failing test when investigating:
    // https://github.com/ReactiveX/rxjs/issues/4095

    const results: (number | string)[] = [];

    const wrapped = new Observable<number>((subscriber) => {
      const subscription = timer(0, asapScheduler).subscribe(subscriber);
      return () => subscription.unsubscribe();
    });
    wrapped.pipe(mergeMap(() => timer(0, asapScheduler))).subscribe({
      next(value) {
        results.push(value);
      },
      complete() {
        results.push('done');
      },
    });

    setTimeout(() => {
      expect(results).to.deep.equal([0, 'done']);
      done();
    }, 0);
  });

  // NOTE: From https://github.com/ReactiveX/rxjs/issues/5436
  it('should properly handle errors from iterables that are processed after some async', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const noXError = new Error('we do not allow x');
      const e1 = cold(' -----a------------b-----|', { a: ['o', 'o', 'o'], b: ['o', 'x', 'o'] });
      const e1subs = '  ^-----------------!      ';
      const expected = '-----(ooo)--------(o#)   ';

      const iterable = function* (data: string[]) {
        for (const d of data) {
          if (d === 'x') {
            throw noXError;
          }
          yield d;
        }
      };
      const result = e1.pipe(mergeMap((x) => of(x).pipe(delay(0), mergeMap(iterable))));

      expectObservable(result).toBe(expected, undefined, noXError);
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

    synchronousObservable
      .pipe(
        mergeMap((value) => of(value)),
        take(3)
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
