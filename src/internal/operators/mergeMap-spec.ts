import { mergeMap, map } from 'rxjs/operators';
import { expect } from 'chai';
import { of, from} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

describe('mergeMap', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((a, b) => { expect(a).to.deep.equal(b); });
  });

  it('should work in the basic use case', () => {
    const results: any[] = [];

    of(1, 2, 3).pipe(
      mergeMap((n, i) => of([n, i]))
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([
      [1, 0],
      [2, 1],
      [3, 2],
      'done',
    ]);
  });

  it('should send errors in the projection function to the subscriber', () => {
    const results: any[] = [];
    let error: Error;

    of(1, 2, 3).pipe(
      mergeMap((n, i) => {
        if (n === 2) {
          throw new Error('bad');
        }
        return of([n, i]);
      })
    )
    .subscribe({
      next(value) { results.push(value); },
      error(err) { error = err; },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([
      [1, 0]
    ]);
    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.equal('bad');
  });

  it('should handle early unsubscribe', () => {
    const results: any[] = [];

    of(1, 2, 3).pipe(
      mergeMap(n => of(n))
    )
    .subscribe({
      next(value, subscription) {
        results.push(value);
        if (value === 2) { subscription.unsubscribe(); }
      },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([
      1,
      2,
    ]);
  });

  //asDiagram('mergeMap(i => 10*i\u2014\u201410*i\u2014\u201410*i\u2014| )')
  it('should map-and-flatten each item to an Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--1-----3--5-------|');
      const e1subs =    '^                  !';
      const e2 =   cold('x-x-x|              ', {x: 10});
      const expected =  '--x-x-x-y-yzyz-z---|';
      const values = {x: 10, y: 30, z: 50};

      const result = e1.pipe(mergeMap(x => e2.pipe(map(i => i * +x))));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many regular interval inners', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold('----a---a---a---(a|)                    ');
      const b =   cold(    '----b---b---(b|)                    ');
      const c =   cold(                '----c---c---c---c---(c|)');
      const d =   cold(                        '----(d|)        ');
      const e1 =   hot('a---b-----------c-------d-------|       ');
      const e1subs =   '^                               !       ';
      const expected = '----a---(ab)(ab)(ab)c---c---(cd)c---(c|)';

      const observableLookup = { a: a, b: b, c: c, d: d };
      const source = e1.pipe(mergeMap((value: any) => observableLookup[value]));

      expectObservable(source).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should map values to constant resolved promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = (value: any) => from(Promise.resolve(42));

    const results: number[] = [];
    source.pipe(mergeMap(project)).subscribe({
      next: x => {
        results.push(x);
      },
      error: () => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      complete: () => {
        expect(results).to.deep.equal([42, 42, 42, 42]);
        done();
      }
    });
  });

  it('should map values to constant rejected promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = function () {
      return from(Promise.reject<number>(42));
    };

    source.pipe(mergeMap(project)).subscribe({
      next: x => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      error: err => {
        expect(err).to.equal(42);
        done();
      },
      complete: () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      }
    });
  });

  it('should map values to resolved promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = function (value: number, index: number) {
      return from(Promise.resolve(value + index));
    };

    const results: number[] = [];
    source.pipe(mergeMap(project)).subscribe({
      next: x => {
        results.push(x);
      },
      error: () => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      complete: () => {
        expect(results).to.deep.equal([4, 4, 4, 4]);
        done();
      }
    });
  });

  it('should map values to rejected promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = function (value: number, index: number) {
      return from(Promise.reject<string>('' + value + '-' + index));
    };

    source.pipe(mergeMap(project)).subscribe({
      next: () => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      error: err => {
        expect(err).to.equal('4-0');
        done();
      },
      complete: () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      }
    });
  });

  it('should mergeMap many outer values to many inner values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =     hot('-a-------b-------c-------d-------|            ');
      const e1subs =     '^                                !            ';
      const inner =  cold('----i---j---k---l---|                        ', values);
      const innersubs = [' ^                   !                        ',
                        '         ^                   !                ',
                        '                 ^                   !        ',
                        '                         ^                   !'];
      const expected =   '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l---|';

      const result = e1.pipe(mergeMap((value) => inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(inner).toBe(innersubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to many inner, complete late', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =    hot('-a-------b-------c-------d-----------------------|');
      const e1subs =    '^                                                !';
      const inner = cold('----i---j---k---l---|                            ', values);
      const expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-------|';

      const result = e1.pipe(mergeMap(() => inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to many inner, outer never completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =    hot('-a-------b-------c-------d-------e---------------f------');
      const unsub =     '^------------------------------------------------------!';
      const e1subs =    '^                                                      !';
      const inner = cold('----i---j---k---l---|                                  ', values);
      const expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i--';

      const source = e1.pipe(mergeMap(() => inner));

      expectObservable(source, unsub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =    hot('-a-------b-------c-------d-------e---------------f------');
      const e1subs =    '^                                                      !';
      const inner = cold('----i---j---k---l---|                                  ', values);
      const expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i--';
      const unsub =     '^------------------------------------------------------!';

      const source = e1.pipe(
        map(x => x),
        mergeMap(() => inner),
        map(x => x),
      );

      expectObservable(source, unsub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to many inner, inner never completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =    hot('-a-------b-------c-------d-------|         ');
      const e1subs =    '^                                !         ';
      const inner = cold('----i---j---k---l-------------------------', values);
      const expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-';

      const result = e1.pipe(mergeMap((value) => inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to many inner, and inner throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =    hot('-a-------b-------c-------d-------|');
      const e1subs =    '^                        !        ';
      const inner = cold('----i---j---k---l-------#        ', values);
      const expected =  '-----i---j---(ki)(lj)(ki)#        ';

      const result = e1.pipe(mergeMap((value) => inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to many inner, and outer throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =    hot('-a-------b-------c-------d-------#');
      const e1subs =    '^                                !';
      const inner = cold('----i---j---k---l---|            ', values);
      const expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)#';

      const result = e1.pipe(mergeMap((value) => inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to many inner, both inner and outer throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =    hot('-a-------b-------c-------d-------#');
      const e1subs =    '^                    !            ';
      const inner = cold('----i---j---k---l---#            ', values);
      const expected =  '-----i---j---(ki)(lj)#            ';

      const result = e1.pipe(mergeMap((value) => inner));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=1', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =     hot('-a-------b-------c---|                                        ');
      const e1subs =     '^                    !                                        ';
      const inner =  cold('----i---j---k---l---|                                        ', values);
      const innersubs = [' ^                   !                                        ',
                        '                     ^                   !                    ',
                        '                                         ^                   !'];
      const expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';

      function project() { return inner; }
      const result = e1.pipe(mergeMap(project, 1));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(inner).toBe(innersubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=2', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =     hot('-a-------b-------c---|                    ');
      const e1subs =     '^                    !                    ';
      const inner =  cold('----i---j---k---l---|                    ', values);
      const innersubs = [' ^                   !                    ',
                        '         ^                   !            ',
                        '                     ^                   !'];
      const expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';

      function project() { return inner; }
      const result = e1.pipe(mergeMap(project, 2));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(inner).toBe(innersubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=1', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =     hot('-a-------b-------c---|                                        ');
      const e1subs =     '^                    !                                        ';
      const hotA =   hot('x----i---j---k---l---|                                        ', values);
      const hotB =   hot('-x-x-xxxx-x-x-xxxxx-x----i---j---k---l---|                    ', values);
      const hotC =   hot('x-xxxx---x-x-x-x-x-xx--x--x-x--x--xxxx-x-----i---j---k---l---|', values);
      const asubs =      ' ^                   !                                        ';
      const bsubs =      '                     ^                   !                    ';
      const csubs =      '                                         ^                   !';
      const expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';
      const inners = { a: hotA, b: hotB, c: hotC };

      function project(x: string) { return inners[x]; }
      const result = e1.pipe(mergeMap(project, 1));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(hotA).toBe(asubs);
      expectSubscriptionsTo(hotB).toBe(bsubs);
      expectSubscriptionsTo(hotC).toBe(csubs);
    });
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=2', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =     hot('-a-------b-------c---|                    ');
      const e1subs =     '^                    !                    ';
      const hotA =   hot('x----i---j---k---l---|                    ', values);
      const hotB =   hot('-x-x-xxxx----i---j---k---l---|            ', values);
      const hotC =   hot('x-xxxx---x-x-x-x-x-xx----i---j---k---l---|', values);
      const asubs =      ' ^                   !                    ';
      const bsubs =      '         ^                   !            ';
      const csubs =      '                     ^                   !';
      const expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';
      const inners = { a: hotA, b: hotB, c: hotC };

      function project(x: string) { return inners[x]; }
      const result = e1.pipe(mergeMap(project, 2));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(hotA).toBe(asubs);
      expectSubscriptionsTo(hotB).toBe(bsubs);
      expectSubscriptionsTo(hotC).toBe(csubs);
    });
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=1', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =     hot('-a-------b-------c---|                                        ');
      const e1subs =     '^                    !                                        ';
      const inner =  cold('----i---j---k---l---|                                        ', values);
      const innersubs = [' ^                   !                                        ',
                        '                     ^                   !                    ',
                        '                                         ^                   !'];
      const expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';

      function project() { return inner; }
      const result = e1.pipe(mergeMap(project, 1));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(inner).toBe(innersubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=2', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =     hot('-a-------b-------c---|                    ');
      const e1subs =     '^                    !                    ';
      const inner =  cold('----i---j---k---l---|                    ', values);
      const innersubs = [' ^                   !                    ',
                        '         ^                   !            ',
                        '                     ^                   !'];
      const expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';

      function project() { return inner; }
      const result = e1.pipe(mergeMap(project, 2));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(inner).toBe(innersubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=1', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =     hot('-a-------b-------c---|                                        ');
      const e1subs =     '^                    !                                        ';
      const hotA =   hot('x----i---j---k---l---|                                        ', values);
      const hotB =   hot('-x-x-xxxx-x-x-xxxxx-x----i---j---k---l---|                    ', values);
      const hotC =   hot('x-xxxx---x-x-x-x-x-xx--x--x-x--x--xxxx-x-----i---j---k---l---|', values);
      const asubs =      ' ^                   !                                        ';
      const bsubs =      '                     ^                   !                    ';
      const csubs =      '                                         ^                   !';
      const expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';
      const inners = { a: hotA, b: hotB, c: hotC };

      function project(x: string) { return inners[x]; }
      const result = e1.pipe(mergeMap(project, 1));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(hotA).toBe(asubs);
      expectSubscriptionsTo(hotB).toBe(bsubs);
      expectSubscriptionsTo(hotC).toBe(csubs);
    });
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=2', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
      const e1 =     hot('-a-------b-------c---|                    ');
      const e1subs =     '^                    !                    ';
      const hotA =   hot('x----i---j---k---l---|                    ', values);
      const hotB =   hot('-x-x-xxxx----i---j---k---l---|            ', values);
      const hotC =   hot('x-xxxx---x-x-x-x-x-xx----i---j---k---l---|', values);
      const asubs =      ' ^                   !                    ';
      const bsubs =      '         ^                   !            ';
      const csubs =      '                     ^                   !';
      const expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';
      const inners = { a: hotA, b: hotB, c: hotC };

      function project(x: string) { return inners[x]; }
      const result = e1.pipe(mergeMap(project, 2));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(hotA).toBe(asubs);
      expectSubscriptionsTo(hotB).toBe(bsubs);
      expectSubscriptionsTo(hotC).toBe(csubs);
    });
  });

  it('should mergeMap many complex, where all inners are finite', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold( '-#'                                                  );
      const b =   cold(   '-#'                                                );
      const c =   cold(        '-2--3--4--5------------------6-|'             );
      const d =   cold(              '-----------2--3|'                       );
      const e =   cold(                     '-1--------2--3-----4--5--------|');
      const f =   cold(                                      '--|'            );
      const g =   cold(                                            '---1-2|'  );
      const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|'       );
      const e1subs =         '^                                      !';
      const expected =       '---2--3--4--5---1--2--3--2--3--6--4--5---1-2--|';

      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

      const result = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, all inners finite except one', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold( '-#'                                                  );
      const b =   cold(   '-#'                                                );
      const c =   cold(        '-2--3--4--5------------------6-|'             );
      const d =   cold(              '-----------2--3-'                       );
      const e =   cold(                     '-1--------2--3-----4--5--------|');
      const f =   cold(                                      '--|'            );
      const g =   cold(                                            '---1-2|'  );
      const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|'       );
      const e1subs =         '^                                      !';
      const expected =       '---2--3--4--5---1--2--3--2--3--6--4--5---1-2----';

      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

      const result = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, inners finite, outer does not complete', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold( '-#'                                                  );
      const b =   cold(   '-#'                                                );
      const c =   cold(        '-2--3--4--5------------------6-|'             );
      const d =   cold(              '-----------2--3|'                       );
      const e =   cold(                     '-1--------2--3-----4--5--------|');
      const f =   cold(                                      '--|'            );
      const g =   cold(                                            '---1-2|'  );
      const e1 =   hot('-a-b--^-c-----d------e----------------f-----g--------');
      const e1subs =         '^                                               ';
      const expected =       '---2--3--4--5---1--2--3--2--3--6--4--5---1-2----';

      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

      const result = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, all inners finite, and outer throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold( '-#'                                                  );
      const b =   cold(   '-#'                                                );
      const c =   cold(        '-2--3--4--5------------------6-|'             );
      const d =   cold(              '-----------2--3|'                       );
      const e =   cold(                     '-1--------2--3-----4--5--------|');
      const f =   cold(                                      '--|'            );
      const g =   cold(                                            '---1-2|'  );
      const e1 =   hot('-a-b--^-c-----d------e----------------f-----g#       ');
      const e1subs =         '^                                      !       ';
      const expected =       '---2--3--4--5---1--2--3--2--3--6--4--5-#       ';

      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

      const result = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, all inners complete except one throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold( '-#'                                                  );
      const b =   cold(   '-#'                                                );
      const c =   cold(        '-2--3--4--5------------------6-#'             );
      const d =   cold(              '-----------2--3|'                       );
      const e =   cold(                     '-1--------2--3-----4--5--------|');
      const f =   cold(                                      '--|'            );
      const g =   cold(                                            '---1-2|'  );
      const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|'       );
      const e1subs =         '^                                !             ';
      const expected =       '---2--3--4--5---1--2--3--2--3--6-#             ';

      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

      const result = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, all inners finite, outer is unsubscribed', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold( '-#'                                                  );
      const b =   cold(   '-#'                                                );
      const c =   cold(        '-2--3--4--5------------------6-|'             );
      const d =   cold(              '-----------2--3|'                       );
      const e =   cold(                     '-1--------2--3-----4--5--------|');
      const f =   cold(                                      '--|'            );
      const g =   cold(                                            '---1-2|'  );
      const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|'       );
      const unsub =          '^-----------------------------!                ';
      const e1subs =         '^                             !                ';
      const expected =       '---2--3--4--5---1--2--3--2--3--                ';

      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const source = e1.pipe(mergeMap((value) => observableLookup[value]));

      expectObservable(source, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many complex, all inners finite, project throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const a =   cold( '-#'                                                  );
      const b =   cold(   '-#'                                                );
      const c =   cold(        '-2--3--4--5------------------6-|'             );
      const d =   cold(              '-----------2--3|'                       );
      const e =   cold(                     '-1--------2--3-----4--5--------|');
      const f =   cold(                                      '--|'            );
      const g =   cold(                                            '---1-2|'  );
      const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|'       );
      const e1subs =         '^              !                               ';
      const expected =       '---2--3--4--5--#                               ';

      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      let invoked = 0;
      const source = e1.pipe(mergeMap((value) => {
        invoked++;
        if (invoked === 3) {
          throw 'error';
        }
        return observableLookup[value];
      }));

      expectObservable(source).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  function arrayRepeat(value: any, times: number): any {
    const results = [];
    for (let i = 0; i < times; i++) {
      results.push(value);
    }
    return results;
  }

  it('should mergeMap many outer to an array for each value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('2-----4--------3--------2-------|');
      const e1subs =   '^                               !';
      const expected = '(22)--(4444)---(333)----(22)----|';

      const source = e1.pipe(mergeMap((value) => arrayRepeat(value, +value)));

      expectObservable(source).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to inner arrays, and outer throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('2-----4--------3--------2-------#');
      const e1subs =   '^                               !';
      const expected = '(22)--(4444)---(333)----(22)----#';

      const source = e1.pipe(mergeMap((value) => arrayRepeat(value, +value)));

      expectObservable(source).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to inner arrays, outer gets unsubscribed', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('2-----4--------3--------2-------|');
      const unsub =    '^------------!                   ';
      const e1subs  =  '^            !                   ';
      const expected = '(22)--(4444)--                   ';

      const source = e1.pipe(mergeMap((value) => arrayRepeat(value, +value)));

      expectObservable(source, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeMap many outer to inner arrays, project throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('2-----4--------3--------2-------|');
      const e1subs =   '^              !                 ';
      const expected = '(22)--(4444)---#                 ';

      let invoked = 0;
      const source = e1.pipe(mergeMap((value) => {
        invoked++;
        if (invoked === 3) {
          throw 'error';
        }
        return arrayRepeat(value, +value);
      }));

      expectObservable(source).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should map and flatten', () => {
    const source = of(1, 2, 3, 4).pipe(mergeMap((x) => of(x + '!')));

    const expected = ['1!', '2!', '3!', '4!'];
    let completed = false;

    source.subscribe({
      next: x => {
        expect(x).to.equal(expected.shift());
      }, complete: () => {
        expect(expected.length).to.equal(0);
        completed = true;
      }
    });

    expect(completed).to.be.true;
  });

  it('should map and flatten an Array', () => {
    const source = of(1, 2, 3, 4).pipe(mergeMap((x): any => [x + '!']));

    const expected = ['1!', '2!', '3!', '4!'];
    let completed = false;

    source.subscribe({
      next: x => {
        expect(x).to.equal(expected.shift());
      }, complete: () => {
        expect(expected.length).to.equal(0);
        completed = true;
      }
    });

    expect(completed).to.be.true;
  });
});
