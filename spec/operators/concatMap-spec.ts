import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;
const Observable = Rx.Observable;

/** @test {concatMap} */
describe('Observable.prototype.concatMap', () => {
  asDiagram('concatMap(i => 10*i\u2014\u201410*i\u2014\u201410*i\u2014| )')
  ('should map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--1-----3--5-------|');
    const e1subs =    '^                  !';
    const e2 =   cold('x-x-x|              ', {x: 10});
    const expected =  '--x-x-x-y-y-yz-z-z-|';
    const values = {x: 10, y: 30, z: 50};

    const result = e1.concatMap(x => e2.map(i => i * x));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatenate many regular interval inners', () => {
    const a =   cold('--a-a-a-(a|)                            ');
    const asubs =    '^       !                               ';
    const b =   cold(        '----b--b--(b|)                  ');
    const bsubs =    '        ^         !                     ';
    const c =   cold(                         '-c-c-(c|)      ');
    const csubs =    '                         ^    !         ';
    const d =   cold(                              '------(d|)');
    const dsubs =    '                              ^     !   ';
    const e1 =   hot('a---b--------------------c-d----|       ');
    const e1subs =   '^                                   !   ';
    const expected = '--a-a-a-a---b--b--b-------c-c-c-----(d|)';

    const observableLookup = { a: a, b: b, c: c, d: d };
    const source = e1.concatMap((value: any) => observableLookup[value]);

    expectObservable(source).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
    expectSubscriptions(c.subscriptions).toBe(csubs);
    expectSubscriptions(d.subscriptions).toBe(dsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer values to many inner values', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---|                        ');
    const e1subs =     '^                                        !';
    const inner =  cold('--i-j-k-l-|                              ', values);
    const innersubs = [' ^         !                              ',
                     '           ^         !                    ',
                     '                     ^         !          ',
                     '                               ^         !'];
    const expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l-|';

    const result = e1.concatMap((value: any) => inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an empty source', () => {
    const e1 = cold( '|');
    const e1subs =   '(^!)';
    const inner = cold('-1-2-3|');
    const innersubs = [];
    const expected = '|';

    const result = e1.concatMap(() => inner);

    expectObservable(result).toBe(expected);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a never source', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const inner = cold('-1-2-3|');
    const innersubs = [];
    const expected = '-';

    const result = e1.concatMap(() => { return inner; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should error immediately if given a just-throw source', () => {
    const e1 = cold( '#');
    const e1subs =   '(^!)';
    const inner = cold('-1-2-3|');
    const innersubs = [];
    const expected = '#';

    const result = e1.concatMap(() => { return inner; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return a silenced version of the source if the mapped inner is empty', () => {
    const e1 = cold(   '--a-b--c-| ');
    const e1subs =     '^        ! ';
    const inner = cold('|');
    const innersubs = ['  (^!)     ',
                     '    (^!)   ',
                     '       (^!)'];
    const expected =   '---------| ';

    const result = e1.concatMap(() => { return inner; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return a never if the mapped inner is never', () => {
    const e1 = cold(  '--a-b--c-|');
    const e1subs =    '^         ';
    const inner = cold('-');
    const innersubs = '  ^       ';
    const expected =  '----------';

    const result = e1.concatMap(() => { return inner; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should propagate errors if the mapped inner is a just-throw Observable', () => {
    const e1 = cold(  '--a-b--c-|');
    const e1subs =    '^ !       ';
    const inner = cold('#');
    const innersubs = '  (^!)    ';
    const expected =  '--#       ';

    const result = e1.concatMap(() => { return inner; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to many inner, complete late', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d----------------------------------|');
    const e1subs =     '^                                               !';
    const inner =  cold('--i-j-k-l-|                                     ', values);
    const innersubs = [' ^         !                                     ',
                     '           ^         !                           ',
                     '                     ^         !                 ',
                     '                               ^         !       '];
    const expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l--------|';

    const result = e1.concatMap((value: any) => inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to many inner, outer never completes', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d-----------------------------------');
    const e1subs =     '^                                                ';
    const inner =  cold('--i-j-k-l-|                                     ', values);
    const innersubs = [' ^         !                                     ',
                     '           ^         !                           ',
                     '                     ^         !                 ',
                     '                               ^         !       '];
    const expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l---------';

    const result = e1.concatMap((value: any) => inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to many inner, inner never completes', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---|');
    const e1subs =     '^                 ';
    const inner =  cold('--i-j-k-l-       ', values);
    const innersubs =  ' ^                ';
    const expected =   '---i-j-k-l--------';

    const result = e1.concatMap((value: any) => inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to many inner, and inner throws', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---|');
    const e1subs =     '^          !      ';
    const inner =  cold('--i-j-k-l-#      ', values);
    const innersubs =  ' ^         !      ';
    const expected =   '---i-j-k-l-#      ';

    const result = e1.concatMap((value: any) => inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to many inner, and outer throws', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---#');
    const e1subs =     '^                !';
    const inner =  cold('--i-j-k-l-|      ', values);
    const innersubs = [' ^         !      ',
                     '           ^     !'];
    const expected =   '---i-j-k-l---i-j-#';

    const result = e1.concatMap((value: any) => inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to many inner, both inner and outer throw', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---#');
    const e1subs =     '^          !      ';
    const inner =  cold('--i-j-k-l-#      ', values);
    const innersubs =  ' ^         !      ';
    const expected =   '---i-j-k-l-#      ';

    const result = e1.concatMap((value: any) => inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many complex, where all inners are finite', () => {
    const a =   cold( '-#                                                          ');
    const asubs = [];
    const b =   cold(   '-#                                                        ');
    const bsubs = [];
    const c =   cold(        '-2--3--4--5----6-|                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3|                           ');
    const dsubs =          '                   ^       !                           ';
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs =          '                           ^                  !        ';
    const f =   cold(                                                    '--|      ');
    const fsubs =          '                                              ^ !      ';
    const g =   cold(                                                      '---1-2|');
    const gsubs =          '                                                ^     !';
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|               ');
    const e1subs =         '^                                                     !';
    const expected =       '---2--3--4--5----6-----2--3-1------2--3-4-5--------1-2|';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.concatMap((value: any) => observableLookup[value]);

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

  it('should concatMap many complex, all inners finite except one', () => {
    const a =   cold( '-#                                                          ');
    const asubs = [];
    const b =   cold(   '-#                                                        ');
    const bsubs = [];
    const c =   cold(        '-2--3--4--5----6-|                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3-                           ');
    const dsubs =          '                   ^                                   ';
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs = [];
    const f =   cold(                                                    '--|      ');
    const fsubs = [];
    const g =   cold(                                                      '---1-2|');
    const gsubs = [];
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|               ');
    const e1subs =         '^                                                      ';
    const expected =       '---2--3--4--5----6-----2--3----------------------------';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.concatMap((value: any) => observableLookup[value]);

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

  it('should concatMap many complex, inners finite, outer does not complete', () => {
    const a =   cold( '-#                                                          ');
    const asubs = [];
    const b =   cold(   '-#                                                        ');
    const bsubs = [];
    const c =   cold(        '-2--3--4--5----6-|                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3|                           ');
    const dsubs =          '                   ^       !                           ';
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs =          '                           ^                  !        ';
    const f =   cold(                                                    '--|      ');
    const fsubs =          '                                              ^ !      ';
    const g =   cold(                                                      '---1-2|');
    const gsubs =          '                                                ^     !';
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g---             ');
    const e1subs =         '^                                                      ';
    const expected =       '---2--3--4--5----6-----2--3-1------2--3-4-5--------1-2-';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.concatMap((value: any) => observableLookup[value]);

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

  it('should concatMap many complex, all inners finite, and outer throws', () => {
    const a =   cold( '-#                                                          ');
    const asubs = [];
    const b =   cold(   '-#                                                        ');
    const bsubs = [];
    const c =   cold(        '-2--3--4--5----6-|                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3|                           ');
    const dsubs =          '                   ^       !                           ';
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs =          '                           ^           !               ';
    const f =   cold(                                                    '--|      ');
    const fsubs = [];
    const g =   cold(                                                      '---1-2|');
    const gsubs = [];
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g#               ');
    const e1subs =         '^                                      !               ';
    const expected =       '---2--3--4--5----6-----2--3-1------2--3#               ';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.concatMap((value: any) => observableLookup[value]);

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

  it('should concatMap many complex, all inners complete except one throws', () => {
    const a =   cold( '-#                                                          ');
    const asubs = [];
    const b =   cold(   '-#                                                        ');
    const bsubs = [];
    const c =   cold(        '-2--3--4--5----6-#                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3|                           ');
    const dsubs = [];
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs = [];
    const f =   cold(                                                    '--|      ');
    const fsubs = [];
    const g =   cold(                                                      '---1-2|');
    const gsubs = [];
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|               ');
    const e1subs =         '^                  !                                   ';
    const expected =       '---2--3--4--5----6-#                                   ';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.concatMap((value: any) => observableLookup[value]);

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

  it('should concatMap many complex, all inners finite, outer is unsubscribed early', () => {
    const a =   cold( '-#                                                          ');
    const asubs = [];
    const b =   cold(   '-#                                                        ');
    const bsubs = [];
    const c =   cold(        '-2--3--4--5----6-|                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3|                           ');
    const dsubs =          '                   ^       !                           ';
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs =          '                           ^  !                        ';
    const f =   cold(                                                    '--|      ');
    const fsubs = [];
    const g =   cold(                                                      '---1-2|');
    const gsubs = [];
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|               ');
    const e1subs =         '^                             !                        ';
    const unsub =          '                              !                        ';
    const expected =       '---2--3--4--5----6-----2--3-1--                        ';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.concatMap((value: any) => observableLookup[value]);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
    expectSubscriptions(c.subscriptions).toBe(csubs);
    expectSubscriptions(d.subscriptions).toBe(dsubs);
    expectSubscriptions(e.subscriptions).toBe(esubs);
    expectSubscriptions(f.subscriptions).toBe(fsubs);
    expectSubscriptions(g.subscriptions).toBe(gsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const a =   cold( '-#                                                          ');
    const asubs = [];
    const b =   cold(   '-#                                                        ');
    const bsubs = [];
    const c =   cold(        '-2--3--4--5----6-|                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3|                           ');
    const dsubs =          '                   ^       !                           ';
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs =          '                           ^  !                        ';
    const f =   cold(                                                    '--|      ');
    const fsubs = [];
    const g =   cold(                                                      '---1-2|');
    const gsubs = [];
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|               ');
    const e1subs =         '^                             !                        ';
    const unsub =          '                              !                        ';
    const expected =       '---2--3--4--5----6-----2--3-1--                        ';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1
      .mergeMap((x: any) => Observable.of(x))
      .concatMap((value: any) => observableLookup[value])
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
    expectSubscriptions(c.subscriptions).toBe(csubs);
    expectSubscriptions(d.subscriptions).toBe(dsubs);
    expectSubscriptions(e.subscriptions).toBe(esubs);
    expectSubscriptions(f.subscriptions).toBe(fsubs);
    expectSubscriptions(g.subscriptions).toBe(gsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many complex, all inners finite, project throws', () => {
    const a =   cold( '-#                                                          ');
    const asubs = [];
    const b =   cold(   '-#                                                        ');
    const bsubs = [];
    const c =   cold(        '-2--3--4--5----6-|                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3|                           ');
    const dsubs =          '                   ^       !                           ';
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs = [];
    const f =   cold(                                                    '--|      ');
    const fsubs = [];
    const g =   cold(                                                      '---1-2|');
    const gsubs = [];
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|               ');
    const e1subs =         '^                          !                           ';
    const expected =       '---2--3--4--5----6-----2--3#                           ';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.concatMap((value: string) => {
      if (value === 'e') { throw 'error'; }
      return observableLookup[value];
    });

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

  function arrayRepeat(value, times) {
    let results = [];
    for (let i = 0; i < times; i++) {
      results.push(value);
    }
    return results;
  }

  it('should concatMap many outer to an array for each value', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^                               !';
    const expected = '(22)--(4444)---(333)----(22)----|';

    const result = e1.concatMap(<any>((value: any) => arrayRepeat(value, value)));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to inner arrays, using resultSelector', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^                               !';
    const expected = '(44)--(8888)---(666)----(44)----|';

    const result = e1.concatMap(<any>((value: any) => arrayRepeat(value, value)),
      (x: string, y: string) => String(parseInt(x) + parseInt(y)));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to inner arrays, and outer throws', () => {
    const e1 =   hot('2-----4--------3--------2-------#');
    const e1subs =   '^                               !';
    const expected = '(22)--(4444)---(333)----(22)----#';

    const result = e1.concatMap(<any>((value: any) => arrayRepeat(value, value)));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to inner arrays, resultSelector, outer throws', () => {
    const e1 =   hot('2-----4--------3--------2-------#');
    const e1subs =   '^                               !';
    const expected = '(44)--(8888)---(666)----(44)----#';

    const result = e1.concatMap(<any>((value: any) => arrayRepeat(value, value)),
      (x: string, y: string) => String(parseInt(x) + parseInt(y)));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, outer unsubscribed early', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^            !                   ';
    const unsub =    '             !                   ';
    const expected = '(22)--(4444)--                   ';

    const result = e1.concatMap(<any>((value: any) => arrayRepeat(value, value)));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to inner arrays, resultSelector, outer unsubscribed', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^            !                   ';
    const unsub =    '             !                   ';
    const expected = '(44)--(8888)--                   ';

    const result = e1.concatMap(<any>((value: any) => arrayRepeat(value, value)),
      (x: string, y: string) => String(parseInt(x) + parseInt(y)));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to inner arrays, project throws', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^              !                 ';
    const expected = '(22)--(4444)---#                 ';

    let invoked = 0;
    const result = e1.concatMap(<any>((value: any) => {
      invoked++;
      if (invoked === 3) {
        throw 'error';
      }
      return arrayRepeat(value, value);
    }));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to inner arrays, resultSelector throws', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^              !                 ';
    const expected = '(44)--(8888)---#                 ';

    const result = e1.concatMap(<any>((value: any) => arrayRepeat(value, value)),
      (inner: any, outer: any) => {
        if (outer === '3') {
          throw 'error';
        }
        return String(parseInt(outer) + parseInt(inner));
      });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMap many outer to inner arrays, resultSelector, project throws', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^              !                 ';
    const expected = '(44)--(8888)---#                 ';

    let invoked = 0;
    const result = e1.concatMap(<any>((value: any) => {
      invoked++;
      if (invoked === 3) {
        throw 'error';
      }
      return arrayRepeat(value, value);
    }), (inner: string, outer: string) => {
      return String(parseInt(outer) + parseInt(inner));
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map values to constant resolved promises and concatenate', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const project = (value: any) => Observable.from(Promise.resolve(42));

    const results = [];
    source.concatMap(project).subscribe(
      (x: any) => {
        results.push(x);
      }, (err: any) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      }, () => {
        expect(results).to.deep.equal([42, 42, 42, 42]);
        done();
      });
  });

  it('should map values to constant rejected promises and concatenate', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const project = (value: any) => Observable.from(Promise.reject(42));

    source.concatMap(project).subscribe(
      (x: any) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      }, (err: any) => {
        expect(err).to.deep.equal(42);
        done();
      }, () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      });
  });

  it('should map values to resolved promises and concatenate', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const project = (value: number, index: number) => Observable.from(Promise.resolve(value + index));

    const results = [];
    source.concatMap(project).subscribe(
      (x: any) => {
        results.push(x);
      }, (err: any) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      }, () => {
        expect(results).to.deep.equal([4, 4, 4, 4]);
        done();
      });
  });

  it('should map values to rejected promises and concatenate', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const project = (value: number, index: number) => Observable.from(Promise.reject('' + value + '-' + index));

    source.concatMap(project).subscribe(
      (x: any) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      }, (err: any) => {
        expect(err).to.deep.equal('4-0');
        done();
      }, () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      });
  });

  it('should concatMap values to resolved promises with resultSelector', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const resultSelectorCalledWith = [];
    const project = (value: number, index: number) => Observable.from((Promise.resolve([value, index])));

    const resultSelector = function (outerVal, innerVal, outerIndex, innerIndex) {
      resultSelectorCalledWith.push([].slice.call(arguments));
      return 8;
    };

    const results = [];
    const expectedCalls = [
      [4, [4, 0], 0, 0],
      [3, [3, 1], 1, 0],
      [2, [2, 2], 2, 0],
      [1, [1, 3], 3, 0]
    ];
    source.concatMap(project, resultSelector).subscribe(
      (x: any) => {
        results.push(x);
      }, (err: any) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      }, () => {
        expect(results).to.deep.equal([8, 8, 8, 8]);
        expect(resultSelectorCalledWith).to.deep.equal(expectedCalls);
        done();
      });
  });

  it('should concatMap values to rejected promises with resultSelector', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const project = (value: number, index: number) => Observable.from(Promise.reject('' + value + '-' + index));

    const resultSelector = () => {
      throw 'this should not be called';
    };

    source.concatMap(project, resultSelector).subscribe(
      (x: any) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      }, (err: any) => {
        expect(err).to.deep.equal('4-0');
        done();
      }, () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      });
  });
});