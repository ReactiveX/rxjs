import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram, type };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {mergeMap} */
describe('Observable.prototype.mergeMap', () => {
  asDiagram('mergeMap(i => 10*i\u2014\u201410*i\u2014\u201410*i\u2014| )')
  ('should map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--1-----3--5-------|');
    const e1subs =    '^                  !';
    const e2 =   cold('x-x-x|              ', {x: 10});
    const expected =  '--x-x-x-y-yzyz-z---|';
    const values = {x: 10, y: 30, z: 50};

    const result = e1.mergeMap(x => e2.map(i => i * x));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many regular interval inners', () => {
    const a =   cold('----a---a---a---(a|)                    ');
    const b =   cold(    '----b---b---(b|)                    ');
    const c =   cold(                '----c---c---c---c---(c|)');
    const d =   cold(                        '----(d|)        ');
    const e1 =   hot('a---b-----------c-------d-------|       ');
    const e1subs =   '^                                   !   ';
    const expected = '----a---(ab)(ab)(ab)c---c---(cd)c---(c|)';

    const observableLookup = { a: a, b: b, c: c, d: d };
    const source = e1.mergeMap((value: any) => observableLookup[value]);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map values to constant resolved promises and merge', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const project = (value: any) => Observable.from(Promise.resolve(42));

    const results = [];
    source.mergeMap(project).subscribe(
      (x: number) => {
        results.push(x);
      },
      (err: any) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      () => {
        expect(results).to.deep.equal([42, 42, 42, 42]);
        done();
      });
  });

  it('should map values to constant rejected promises and merge', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const project = function (value) {
      return Observable.from(Promise.reject<number>(42));
    };

    source.mergeMap(project).subscribe(
      (x: number) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      (err: any) => {
        expect(err).to.equal(42);
        done();
      },
      () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      });
  });

  it('should map values to resolved promises and merge', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const project = function (value, index) {
      return Observable.from(Promise.resolve(value + index));
    };

    const results = [];
    source.mergeMap(project).subscribe(
      (x: number) => {
        results.push(x);
      },
      (err: any) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      () => {
        expect(results).to.deep.equal([4, 4, 4, 4]);
        done();
      });
  });

  it('should map values to rejected promises and merge', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const project = function (value, index) {
      return Observable.from(Promise.reject<string>('' + value + '-' + index));
    };

    source.mergeMap(project).subscribe(
      (x: string) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      (err: any) => {
        expect(err).to.equal('4-0');
        done();
      },
      () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      });
  });

  it('should mergeMap values to resolved promises with resultSelector', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const resultSelectorCalledWith = [];
    const project = function (value, index) {
      return Observable.from(Promise.resolve([value, index]));
    };
    const resultSelector = function (outerVal, innerVal, outerIndex, innerIndex) {
      resultSelectorCalledWith.push([].slice.call(arguments));
      return 8;
    };

    const results = [];
    const expectedCalls = [
      [4, [4, 0], 0, 0],
      [3, [3, 1], 1, 0],
      [2, [2, 2], 2, 0],
      [1, [1, 3], 3, 0],
    ];
    source.mergeMap(project, resultSelector).subscribe(
      (x: number) => {
        results.push(x);
      },
      (err: any) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      () => {
        expect(results).to.deep.equal([8, 8, 8, 8]);
        expect(resultSelectorCalledWith).to.deep.equal(expectedCalls);
        done();
      });
  });

  it('should mergeMap values to rejected promises with resultSelector', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const project = function (value, index) {
      return Observable.from(Promise.reject('' + value + '-' + index));
    };
    const resultSelector = () => {
      throw 'this should not be called';
    };

    source.mergeMap(project, resultSelector).subscribe(
      (x: any) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      (err: any) => {
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
    const e1subs =     '^                                            !';
    const inner =  cold('----i---j---k---l---|                        ', values);
    const innersubs = [' ^                   !                        ',
                     '         ^                   !                ',
                     '                 ^                   !        ',
                     '                         ^                   !'];
    const expected =   '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l---|';

    const result = e1.mergeMap((value: any) => inner);

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

    const result = e1.mergeMap((value: any) => inner);

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

    const source = e1.mergeMap((value: any) => inner);

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

    const source = e1
      .map(function (x) { return x; })
      .mergeMap((value: any) => inner)
      .map(function (x) { return x; });

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, inner never completes', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =    hot('-a-------b-------c-------d-------|         ');
    const e1subs =    '^                                          ';
    const inner = cold('----i---j---k---l-------------------------', values);
    const expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-';

    const result = e1.mergeMap((value: any) => inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, and inner throws', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =    hot('-a-------b-------c-------d-------|');
    const e1subs =    '^                        !        ';
    const inner = cold('----i---j---k---l-------#        ', values);
    const expected =  '-----i---j---(ki)(lj)(ki)#        ';

    const result = e1.mergeMap((value: any) => inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, and outer throws', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =    hot('-a-------b-------c-------d-------#');
    const e1subs =    '^                                !';
    const inner = cold('----i---j---k---l---|            ', values);
    const expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)#';

    const result = e1.mergeMap((value: any) => inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, both inner and outer throw', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =    hot('-a-------b-------c-------d-------#');
    const e1subs =    '^                    !            ';
    const inner = cold('----i---j---k---l---#            ', values);
    const expected =  '-----i---j---(ki)(lj)#            ';

    const result = e1.mergeMap((value: any) => inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=1', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                                        ');
    const e1subs =     '^                                                            !';
    const inner =  cold('----i---j---k---l---|                                        ', values);
    const innersubs = [' ^                   !                                        ',
                     '                     ^                   !                    ',
                     '                                         ^                   !'];
    const expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';

    function project() { return inner; }
    function resultSelector(oV, iV, oI, iI) { return iV; }
    const result = e1.mergeMap(project, resultSelector, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=2', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                    ');
    const e1subs =     '^                                        !';
    const inner =  cold('----i---j---k---l---|                    ', values);
    const innersubs = [' ^                   !                    ',
                     '         ^                   !            ',
                     '                     ^                   !'];
    const expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';

    function project() { return inner; }
    function resultSelector(oV, iV, oI, iI) { return iV; }
    const result = e1.mergeMap(project, resultSelector, 2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=1', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                                        ');
    const e1subs =     '^                                                            !';
    const hotA =   hot('x----i---j---k---l---|                                        ', values);
    const hotB =   hot('-x-x-xxxx-x-x-xxxxx-x----i---j---k---l---|                    ', values);
    const hotC =   hot('x-xxxx---x-x-x-x-x-xx--x--x-x--x--xxxx-x-----i---j---k---l---|', values);
    const asubs =      ' ^                   !                                        ';
    const bsubs =      '                     ^                   !                    ';
    const csubs =      '                                         ^                   !';
    const expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';
    const inners = { a: hotA, b: hotB, c: hotC };

    function project(x) { return inners[x]; }
    function resultSelector(oV, iV, oI, iI) { return iV; }
    const result = e1.mergeMap(project, resultSelector, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(hotA.subscriptions).toBe(asubs);
    expectSubscriptions(hotB.subscriptions).toBe(bsubs);
    expectSubscriptions(hotC.subscriptions).toBe(csubs);
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=2', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                    ');
    const e1subs =     '^                                        !';
    const hotA =   hot('x----i---j---k---l---|                    ', values);
    const hotB =   hot('-x-x-xxxx----i---j---k---l---|            ', values);
    const hotC =   hot('x-xxxx---x-x-x-x-x-xx----i---j---k---l---|', values);
    const asubs =      ' ^                   !                    ';
    const bsubs =      '         ^                   !            ';
    const csubs =      '                     ^                   !';
    const expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';
    const inners = { a: hotA, b: hotB, c: hotC };

    function project(x) { return inners[x]; }
    function resultSelector(oV, iV, oI, iI) { return iV; }
    const result = e1.mergeMap(project, resultSelector, 2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(hotA.subscriptions).toBe(asubs);
    expectSubscriptions(hotB.subscriptions).toBe(bsubs);
    expectSubscriptions(hotC.subscriptions).toBe(csubs);
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=1, without resultSelector', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                                        ');
    const e1subs =     '^                                                            !';
    const inner =  cold('----i---j---k---l---|                                        ', values);
    const innersubs = [' ^                   !                                        ',
                     '                     ^                   !                    ',
                     '                                         ^                   !'];
    const expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';

    function project() { return inner; }
    const result = e1.mergeMap(project, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=2, without resultSelector', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                    ');
    const e1subs =     '^                                        !';
    const inner =  cold('----i---j---k---l---|                    ', values);
    const innersubs = [' ^                   !                    ',
                     '         ^                   !            ',
                     '                     ^                   !'];
    const expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';

    function project() { return inner; }
    const result = e1.mergeMap(project, 2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=1, without resultSelector', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                                        ');
    const e1subs =     '^                                                            !';
    const hotA =   hot('x----i---j---k---l---|                                        ', values);
    const hotB =   hot('-x-x-xxxx-x-x-xxxxx-x----i---j---k---l---|                    ', values);
    const hotC =   hot('x-xxxx---x-x-x-x-x-xx--x--x-x--x--xxxx-x-----i---j---k---l---|', values);
    const asubs =      ' ^                   !                                        ';
    const bsubs =      '                     ^                   !                    ';
    const csubs =      '                                         ^                   !';
    const expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';
    const inners = { a: hotA, b: hotB, c: hotC };

    function project(x) { return inners[x]; }
    const result = e1.mergeMap(project, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(hotA.subscriptions).toBe(asubs);
    expectSubscriptions(hotB.subscriptions).toBe(bsubs);
    expectSubscriptions(hotC.subscriptions).toBe(csubs);
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=2, without resultSelector', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                    ');
    const e1subs =     '^                                        !';
    const hotA =   hot('x----i---j---k---l---|                    ', values);
    const hotB =   hot('-x-x-xxxx----i---j---k---l---|            ', values);
    const hotC =   hot('x-xxxx---x-x-x-x-x-xx----i---j---k---l---|', values);
    const asubs =      ' ^                   !                    ';
    const bsubs =      '         ^                   !            ';
    const csubs =      '                     ^                   !';
    const expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';
    const inners = { a: hotA, b: hotB, c: hotC };

    function project(x) { return inners[x]; }
    const result = e1.mergeMap(project, 2);

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
    const e1subs =         '^                                             !';
    const expected =       '---2--3--4--5---1--2--3--2--3--6--4--5---1-2--|';

    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.mergeMap((value: any) => observableLookup[value]);

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
    const e1subs =         '^                                               ';
    const expected =       '---2--3--4--5---1--2--3--2--3--6--4--5---1-2----';

    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.mergeMap((value: any) => observableLookup[value]);

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

    const result = e1.mergeMap((value: any) => observableLookup[value]);

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

    const result = e1.mergeMap((value: any) => observableLookup[value]);

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

    const result = e1.mergeMap((value: any) => observableLookup[value]);

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
    const source = e1.mergeMap((value: any) => observableLookup[value]);

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
    const source = e1.mergeMap((value: any) => {
      invoked++;
      if (invoked === 3) {
        throw 'error';
      }
      return observableLookup[value];
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  function arrayRepeat(value, times): any {
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

    const source = e1.mergeMap((value: any) => arrayRepeat(value, value));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, using resultSelector', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^                               !';
    const expected = '(44)--(8888)---(666)----(44)----|';

    const source = e1.mergeMap((value: any) => arrayRepeat(value, value),
      (x: string, y: string) => String(parseInt(x) + parseInt(y)));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, and outer throws', () => {
    const e1 =   hot('2-----4--------3--------2-------#');
    const e1subs =   '^                               !';
    const expected = '(22)--(4444)---(333)----(22)----#';

    const source = e1.mergeMap((value: any) => arrayRepeat(value, value));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, resultSelector, outer throws', () => {
    const e1 =   hot('2-----4--------3--------2-------#');
    const e1subs =   '^                               !';
    const expected = '(44)--(8888)---(666)----(44)----#';

    const source = e1.mergeMap((value: any) => arrayRepeat(value, value),
      (x: string, y: string) => String(parseInt(x) + parseInt(y)));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, outer gets unsubscribed', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const unsub =    '             !                   ';
    const e1subs  =  '^            !                   ';
    const expected = '(22)--(4444)--                   ';

    const source = e1.mergeMap((value: any) => arrayRepeat(value, value));

    expectObservable(source, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, resultSelector, outer unsubscribed', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const unsub =    '             !                   ';
    const e1subs =   '^            !                   ';
    const expected = '(44)--(8888)--                   ';

     const source = e1.mergeMap((value: any) => arrayRepeat(value, value),
      (x: string, y: string) => String(parseInt(x) + parseInt(y)));

    expectObservable(source, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, project throws', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^              !                 ';
    const expected = '(22)--(4444)---#                 ';

    let invoked = 0;
    const source = e1.mergeMap((value: any) => {
      invoked++;
      if (invoked === 3) {
        throw 'error';
      }
      return arrayRepeat(value, value);
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, resultSelector throws', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs  =  '^              !                 ';
    const expected = '(44)--(8888)---#                 ';

    const source = e1.mergeMap((value: any) => arrayRepeat(value, value),
      (inner: string, outer: string) => {
        if (outer === '3') {
          throw 'error';
        }
        return String(parseInt(outer) + parseInt(inner));
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, resultSelector, project throws', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs  =  '^              !                 ';
    const expected = '(44)--(8888)---#                 ';

    let invoked = 0;
    const source = e1.mergeMap((value: any) => {
      invoked++;
      if (invoked === 3) {
        throw 'error';
      }
      return arrayRepeat(value, value);
    }, (inner: string, outer: string) => {
      return String(parseInt(outer) + parseInt(inner));
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map and flatten', () => {
    const source = Observable.of(1, 2, 3, 4).mergeMap((x: number) => Observable.of(x + '!'));

    const expected = ['1!', '2!', '3!', '4!'];
    let completed = false;

    source.subscribe((x: string) => {
      expect(x).to.equal(expected.shift());
    }, null, () => {
      expect(expected.length).to.equal(0);
      completed = true;
    });

    expect(completed).to.be.true;
  });

  it('should map and flatten an Array', () => {
    const source = Observable.of(1, 2, 3, 4).mergeMap((x: number): any => [x + '!']);

    const expected = ['1!', '2!', '3!', '4!'];
    let completed = false;

    source.subscribe((x: string) => {
      expect(x).to.equal(expected.shift());
    }, null, () => {
      expect(expected.length).to.equal(0);
      completed = true;
    });

    expect(completed).to.be.true;
  });

  it('should support type signatures', () => {
    type(() => {
      let o: Rx.Observable<number>;

      /* tslint:disable:no-unused-variable */
      let a1: Rx.Observable<string> = o.mergeMap(x => x.toString());
      let a2: Rx.Observable<string> = o.mergeMap(x => x.toString(), 3);
      let a3: Rx.Observable<{ o: number; i: string; }> = o.mergeMap(x => x.toString(), (o, i) => ({ o, i }));
      let a4: Rx.Observable<{ o: number; i: string; }> = o.mergeMap(x => x.toString(), (o, i) => ({ o, i }), 3);
      /* tslint:enable:no-unused-variable */
    });
  });
});
