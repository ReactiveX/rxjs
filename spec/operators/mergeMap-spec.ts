import { expect } from 'chai';
import { mergeMap, map } from 'rxjs/operators';
import { asapScheduler, defer, Observable, from, of, timer } from 'rxjs';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare const type: Function;
declare const asDiagram: Function;

/** @test {mergeMap} */
describe('mergeMap', () => {
  asDiagram('mergeMap(i => 10*i\u2014\u201410*i\u2014\u201410*i\u2014| )')
  ('should map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--1-----3--5-------|');
    const e1subs =    '^                  !';
    const e2 =   cold('x-x-x|              ', {x: 10});
    const expected =  '--x-x-x-y-yzyz-z---|';
    const values = {x: 10, y: 30, z: 50};

    const result = e1.pipe(mergeMap(x => e2.pipe(
      map(i => i * +x)
    )));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should support the deprecated resultSelector', () => {
    const results: Array<number[]> = [];

    of(1, 2, 3).pipe(
      mergeMap(
        x => of(x, x + 1, x + 2),
        (a, b, i, ii) => [a, b, i, ii]
      )
    )
    .subscribe({
      next (value) {
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
      }
    });
  });

  it('should support a void resultSelector (still deprecated)', () => {
    const results: number[] = [];

    of(1, 2, 3).pipe(
      mergeMap(
        x => of(x, x + 1, x + 2),
        void 0
      )
    )
    .subscribe({
      next (value) {
        results.push(value);
      },
      error(err) {
        throw err;
      },
      complete() {
        expect(results).to.deep.equal([
          1, 2, 3, 2, 3, 4, 3, 4, 5
        ]);
      }
    });
  });

  it('should support a void resultSelector (still deprecated) and concurrency limit', () => {
    const results: number[] = [];

    of(1, 2, 3).pipe(
      mergeMap(
        x => of(x, x + 1, x + 2),
        void 0,
        1,
      )
    )
    .subscribe({
      next (value) {
        results.push(value);
      },
      error(err) {
        throw err;
      },
      complete() {
        expect(results).to.deep.equal([
          1, 2, 3, 2, 3, 4, 3, 4, 5
        ]);
      }
    });
  });

  it('should mergeMap many regular interval inners', () => {
    const a =   cold('----a---a---a---(a|)                    ');
    const b =   cold(    '----b---b---(b|)                    ');
    const c =   cold(                '----c---c---c---c---(c|)');
    const d =   cold(                        '----(d|)        ');
    const e1 =   hot('a---b-----------c-------d-------|       ');
    const e1subs =   '^                               !       ';
    const expected = '----a---(ab)(ab)(ab)c---c---(cd)c---(c|)';

    const observableLookup = { a: a, b: b, c: c, d: d };
    const source = e1.pipe(mergeMap((value) => observableLookup[value]));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map values to constant resolved promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = (value: any) => from(Promise.resolve(42));

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
      });
  });

  it('should map values to constant rejected promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = function (value: any) {
      return from(Promise.reject<number>(42));
    };

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
      });
  });

  it('should map values to resolved promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = function (value: number, index: number) {
      return from(Promise.resolve(value + index));
    };

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
      });
  });

  it('should map values to rejected promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = function (value: number, index: number) {
      return from(Promise.reject<string>('' + value + '-' + index));
    };

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
      });
  });

  it('should mergeMap many outer values to many inner values', () => {
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
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, complete late', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =    hot('-a-------b-------c-------d-----------------------|');
    const e1subs =    '^                                                !';
    const inner = cold('----i---j---k---l---|                            ', values);
    const expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-------|';

    const result = e1.pipe(mergeMap((value) => inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, outer never completes', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =    hot('-a-------b-------c-------d-------e---------------f------');
    const unsub =     '                                                       !';
    const e1subs =    '^                                                      !';
    const inner = cold('----i---j---k---l---|                                  ', values);
    const expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i--';

    const source = e1.pipe(mergeMap((value) => inner));

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =    hot('-a-------b-------c-------d-------e---------------f------');
    const e1subs =    '^                                                      !';
    const inner = cold('----i---j---k---l---|                                  ', values);
    const expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i--';
    const unsub =     '                                                       !';

    const source = e1.pipe(
      map(x => x),
      mergeMap((value) => inner),
      map(x => x),
    );

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, inner never completes', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =    hot('-a-------b-------c-------d-------|         ');
    const e1subs =    '^                                !         ';
    const inner = cold('----i---j---k---l-------------------------', values);
    const expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-';

    const result = e1.pipe(mergeMap((value) => inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, and inner throws', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =    hot('-a-------b-------c-------d-------|');
    const e1subs =    '^                        !        ';
    const inner = cold('----i---j---k---l-------#        ', values);
    const expected =  '-----i---j---(ki)(lj)(ki)#        ';

    const result = e1.pipe(mergeMap((value) => inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, and outer throws', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =    hot('-a-------b-------c-------d-------#');
    const e1subs =    '^                                !';
    const inner = cold('----i---j---k---l---|            ', values);
    const expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)#';

    const result = e1.pipe(mergeMap((value) => inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, both inner and outer throw', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =    hot('-a-------b-------c-------d-------#');
    const e1subs =    '^                    !            ';
    const inner = cold('----i---j---k---l---#            ', values);
    const expected =  '-----i---j---(ki)(lj)#            ';

    const result = e1.pipe(mergeMap((value) => inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=1', () => {
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
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=2', () => {
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
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=1', () => {
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
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(hotA.subscriptions).toBe(asubs);
    expectSubscriptions(hotB.subscriptions).toBe(bsubs);
    expectSubscriptions(hotC.subscriptions).toBe(csubs);
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=2', () => {
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
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(hotA.subscriptions).toBe(asubs);
    expectSubscriptions(hotB.subscriptions).toBe(bsubs);
    expectSubscriptions(hotC.subscriptions).toBe(csubs);
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=1', () => {
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
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=2', () => {
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
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=1', () => {
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
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(hotA.subscriptions).toBe(asubs);
    expectSubscriptions(hotB.subscriptions).toBe(bsubs);
    expectSubscriptions(hotC.subscriptions).toBe(csubs);
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=2', () => {
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
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(hotA.subscriptions).toBe(asubs);
    expectSubscriptions(hotB.subscriptions).toBe(bsubs);
    expectSubscriptions(hotC.subscriptions).toBe(csubs);
  });

  it('should mergeMap many complex, where all inners are finite', () => {
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
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many complex, all inners finite except one', () => {
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
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many complex, inners finite, outer does not complete', () => {
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
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many complex, all inners finite, and outer throws', () => {
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
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many complex, all inners complete except one throws', () => {
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
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many complex, all inners finite, outer is unsubscribed', () => {
    const a =   cold( '-#'                                                  );
    const b =   cold(   '-#'                                                );
    const c =   cold(        '-2--3--4--5------------------6-|'             );
    const d =   cold(              '-----------2--3|'                       );
    const e =   cold(                     '-1--------2--3-----4--5--------|');
    const f =   cold(                                      '--|'            );
    const g =   cold(                                            '---1-2|'  );
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|'       );
    const unsub =          '                              !                ';
    const e1subs =         '^                             !                ';
    const expected =       '---2--3--4--5---1--2--3--2--3--                ';

    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
    const source = e1.pipe(mergeMap((value) => observableLookup[value]));

    expectObservable(source, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many complex, all inners finite, project throws', () => {
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
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  function arrayRepeat(value: any, times: number): any {
    const results = [];
    for (let i = 0; i < times; i++) {
      results.push(value);
    }
    return results;
  }

  it('should mergeMap many outer to an array for each value', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^                               !';
    const expected = '(22)--(4444)---(333)----(22)----|';

    const source = e1.pipe(mergeMap((value) => arrayRepeat(value, +value)));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, and outer throws', () => {
    const e1 =   hot('2-----4--------3--------2-------#');
    const e1subs =   '^                               !';
    const expected = '(22)--(4444)---(333)----(22)----#';

    const source = e1.pipe(mergeMap((value) => arrayRepeat(value, +value)));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, outer gets unsubscribed', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const unsub =    '             !                   ';
    const e1subs  =  '^            !                   ';
    const expected = '(22)--(4444)--                   ';

    const source = e1.pipe(mergeMap((value) => arrayRepeat(value, +value)));

    expectObservable(source, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, project throws', () => {
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
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map and flatten', () => {
    const source = of(1, 2, 3, 4).pipe(mergeMap((x) => of(x + '!')));

    const expected = ['1!', '2!', '3!', '4!'];
    let completed = false;

    source.subscribe((x) => {
      expect(x).to.equal(expected.shift());
    }, null, () => {
      expect(expected.length).to.equal(0);
      completed = true;
    });

    expect(completed).to.be.true;
  });

  it('should map and flatten an Array', () => {
    const source = of(1, 2, 3, 4).pipe(mergeMap((x): any => [x + '!']));

    const expected = ['1!', '2!', '3!', '4!'];
    let completed = false;

    source.subscribe((x) => {
      expect(x).to.equal(expected.shift());
    }, null, () => {
      expect(expected.length).to.equal(0);
      completed = true;
    });

    expect(completed).to.be.true;
  });

  it('should support nested merges', (done: MochaDone) => {

    // Added as a failing test when investigating:
    // https://github.com/ReactiveX/rxjs/issues/4071

    const results: (number | string)[] = [];

    of(1).pipe(
      mergeMap(() => defer(() =>
        of(2, asapScheduler)
      ).pipe(
        mergeMap(() => defer(() =>
          of(3, asapScheduler)
        ))
      ))
    )
    .subscribe({
      next(value: any) { results.push(value); },
      complete() { results.push('done'); }
    });

    setTimeout(() => {
      expect(results).to.deep.equal([3, 'done']);
      done();
    }, 0);
  });

  it('should support nested merges with promises', (done: MochaDone) => {

    // Added as a failing test when investigating:
    // https://github.com/ReactiveX/rxjs/issues/4071

    const results: (number | string)[] = [];

    of(1).pipe(
      mergeMap(() =>
        from(Promise.resolve(2)).pipe(
          mergeMap(() => Promise.resolve(3))
        )
      )
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); }
    });

    setTimeout(() => {
      expect(results).to.deep.equal([3, 'done']);
      done();
    }, 0);
  });

  it('should support wrapped sources', (done: MochaDone) => {

    // Added as a failing test when investigating:
    // https://github.com/ReactiveX/rxjs/issues/4095

    const results: (number | string)[] = [];

    const wrapped = new Observable<number>(subscriber => {
        const subscription = timer(0, asapScheduler).subscribe(subscriber);
        return () => subscription.unsubscribe();
    });
    wrapped.pipe(
      mergeMap(() => timer(0, asapScheduler))
    ).subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); }
    });

    setTimeout(() => {
      expect(results).to.deep.equal([0, 'done']);
      done();
    }, 0);
  });

  type('should support type signatures', () => {
    let o: Observable<number>;

    /* tslint:disable:no-unused-variable */
    let a1: Observable<string> = o.pipe(mergeMap(x => x.toString()));
    let a2: Observable<string> = o.pipe(mergeMap(x => x.toString(), 3));
    let a3: Observable<{ o: number; i: string; }> = o.pipe(mergeMap(x => x.toString(), (o, i) => ({ o, i })));
    let a4: Observable<{ o: number; i: string; }> = o.pipe(mergeMap(x => x.toString(), (o, i) => ({ o, i }), 3));
    /* tslint:enable:no-unused-variable */
  });
});
