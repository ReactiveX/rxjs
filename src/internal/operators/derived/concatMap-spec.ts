import { concatMap, take, map, mergeMap } from 'rxjs/operators';
import { interval, of, from } from 'rxjs';
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

describe('concatMap', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((a, b) => { expect(a).to.deep.equal(b); });
  });

  it('should do a basic concat map', (done: MochaDone) => {
    const results: any[] = [];

    const source = of('a', 'b');
    source.pipe(
      concatMap(n => interval(10).pipe(
        take(3),
        map(m => `${n}-${m}`),
      )),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() {
        results.push('done');
        expect(results).to.deep.equal(['a-0', 'a-1', 'a-2', 'b-0', 'b-1', 'b-2', 'done']);
        done();
      },
    });
  });

  //asDiagram('concatMap(i => 10*i\u2014\u201410*i\u2014\u201410*i\u2014| )')
  it('should map-and-flatten each item to an Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--1-----3--5-------|');
      const e1subs =    '^                  !';
      const e2 =   cold('x-x-x|              ', {x: 10});
      const expected =  '--x-x-x-y-y-yz-z-z-|';
      const values = {x: 10, y: 30, z: 50};

      const result = e1.pipe(
        concatMap(x => e2.pipe(map(i => i * parseInt(x))))
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should concatenate many regular interval inners', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const a =   cold('--a-a-a-(a|)                            ');
    const asubs =    '^       !                               ';
    const b =   cold(        '----b--b--(b|)                  ');
    const bsubs =    '        ^         !                     ';
    const c =   cold(                         '-c-c-(c|)      ');
    const csubs =    '                         ^    !         ';
    const d =   cold(                              '------(d|)');
    const dsubs =    '                              ^     !   ';
    const e1 =   hot('a---b--------------------c-d----|       ');
    const e1subs =   '^                               !       ';
    const expected = '--a-a-a-a---b--b--b-------c-c-c-----(d|)';

    const observableLookup = { a: a, b: b, c: c, d: d };
    const source = e1.pipe(concatMap((value) => observableLookup[value]));

    expectObservable(source).toBe(expected);
    expectSubscriptionsTo(a).toBe(asubs);
    expectSubscriptionsTo(b).toBe(bsubs);
    expectSubscriptionsTo(c).toBe(csubs);
    expectSubscriptionsTo(d).toBe(dsubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many outer values to many inner values', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---|                        ');
    const e1subs =     '^                !                        ';
    const inner = cold('--i-j-k-l-|                               ', values);
    const innersubs = [' ^         !                              ',
                       '           ^         !                    ',
                       '                     ^         !          ',
                       '                               ^         !'];
    const expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l-|';

    const result = e1.pipe(concatMap((value) => inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should handle an empty source', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const e1 = cold( '|');
    const e1subs =   '(^!)';
    const inner = cold('-1-2-3|');
    const innersubs: string[] = [];
    const expected = '|';

    const result = e1.pipe(concatMap(() => inner));

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should handle a never source', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const inner = cold('-1-2-3|');
    const innersubs: string[] = [];
    const expected = '-';

    const result = e1.pipe(concatMap(() => { return inner; }));

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should error immediately if given a just-throw source', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const e1 = cold( '#');
    const e1subs =   '(^!)';
    const inner = cold('-1-2-3|');
    const innersubs: string[] = [];
    const expected = '#';

    const result = e1.pipe(concatMap(() => { return inner; }));

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should return a silenced version of the source if the mapped inner is empty', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const e1 = cold(   '--a-b--c-| ');
    const e1subs =     '^        ! ';
    const inner = cold('|');
    const innersubs = ['  (^!)     ',
                       '    (^!)   ',
                       '       (^!)'];
    const expected =   '---------| ';

    const result = e1.pipe(concatMap(() => { return inner; }));

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should return a never if the mapped inner is never', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const e1 = cold(  '--a-b--c-|');
    const e1subs =    '^        !';
    const inner = cold('-');
    const innersubs = '  ^       ';
    const expected =  '----------';

    const result = e1.pipe(concatMap(() => { return inner; }));

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should propagate errors if the mapped inner is a just-throw Observable', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const e1 = cold(  '--a-b--c-|');
    const e1subs =    '^ !       ';
    const inner = cold('#');
    const innersubs = '  (^!)    ';
    const expected =  '--#       ';

    const result = e1.pipe(concatMap(() => { return inner; }));

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many outer to many inner, complete late', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d----------------------------------|');
    const e1subs =     '^                                               !';
    const inner =  cold('--i-j-k-l-|                                     ', values);
    const innersubs = [' ^         !                                     ',
                       '           ^         !                           ',
                       '                     ^         !                 ',
                       '                               ^         !       '];
    const expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l--------|';

    const result = e1.pipe(concatMap((value) => inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many outer to many inner, outer never completes', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d-----------------------------------');
    const e1subs =     '^                                                ';
    const inner =  cold('--i-j-k-l-|                                     ', values);
    const innersubs = [' ^         !                                     ',
                       '           ^         !                           ',
                       '                     ^         !                 ',
                       '                               ^         !       '];
    const expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l---------';

    const result = e1.pipe(concatMap((value) => inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many outer to many inner, inner never completes', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---|');
    const e1subs =     '^                !';
    const inner =  cold('--i-j-k-l-       ', values);
    const innersubs =  ' ^                ';
    const expected =   '---i-j-k-l--------';

    const result = e1.pipe(concatMap((value) => inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many outer to many inner, and inner throws', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---|');
    const e1subs =     '^          !      ';
    const inner =  cold('--i-j-k-l-#      ', values);
    const innersubs =  ' ^         !      ';
    const expected =   '---i-j-k-l-#      ';

    const result = e1.pipe(concatMap((value) => inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many outer to many inner, and outer throws', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---#');
    const e1subs =     '^                !';
    const inner =  cold('--i-j-k-l-|      ', values);
    const innersubs = [' ^         !      ',
                       '           ^     !'];
    const expected =   '---i-j-k-l---i-j-#';

    const result = e1.pipe(concatMap((value) => inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many outer to many inner, both inner and outer throw', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---#');
    const e1subs =     '^          !      ';
    const inner =  cold('--i-j-k-l-#      ', values);
    const innersubs =  ' ^         !      ';
    const expected =   '---i-j-k-l-#      ';

    const result = e1.pipe(concatMap((value) => inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptionsTo(inner).toBe(innersubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many complex, where all inners are finite', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const a =   cold( '-#                                                          ');
    const asubs: string[] = [];
    const b =   cold(   '-#                                                        ');
    const bsubs: string[] = [];
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
    const e1subs =         '^                                      !               ';
    const expected =       '---2--3--4--5----6-----2--3-1------2--3-4-5--------1-2|';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.pipe(concatMap((value) => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(a).toBe(asubs);
    expectSubscriptionsTo(b).toBe(bsubs);
    expectSubscriptionsTo(c).toBe(csubs);
    expectSubscriptionsTo(d).toBe(dsubs);
    expectSubscriptionsTo(e).toBe(esubs);
    expectSubscriptionsTo(f).toBe(fsubs);
    expectSubscriptionsTo(g).toBe(gsubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many complex, all inners finite except one', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const a =   cold( '-#                                                          ');
    const asubs: string[] = [];
    const b =   cold(   '-#                                                        ');
    const bsubs: string[] = [];
    const c =   cold(        '-2--3--4--5----6-|                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3-                           ');
    const dsubs =          '                   ^                                   ';
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs: string[] = [];
    const f =   cold(                                                    '--|      ');
    const fsubs: string[] = [];
    const g =   cold(                                                      '---1-2|');
    const gsubs: string[] = [];
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|               ');
    const e1subs =         '^                                      !               ' ;
    const expected =       '---2--3--4--5----6-----2--3----------------------------';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.pipe(concatMap((value) => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(a).toBe(asubs);
    expectSubscriptionsTo(b).toBe(bsubs);
    expectSubscriptionsTo(c).toBe(csubs);
    expectSubscriptionsTo(d).toBe(dsubs);
    expectSubscriptionsTo(e).toBe(esubs);
    expectSubscriptionsTo(f).toBe(fsubs);
    expectSubscriptionsTo(g).toBe(gsubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many complex, inners finite, outer does not complete', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const a =   cold( '-#                                                          ');
    const asubs: string[] = [];
    const b =   cold(   '-#                                                        ');
    const bsubs: string[] = [];
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

    const result = e1.pipe(concatMap((value) => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(a).toBe(asubs);
    expectSubscriptionsTo(b).toBe(bsubs);
    expectSubscriptionsTo(c).toBe(csubs);
    expectSubscriptionsTo(d).toBe(dsubs);
    expectSubscriptionsTo(e).toBe(esubs);
    expectSubscriptionsTo(f).toBe(fsubs);
    expectSubscriptionsTo(g).toBe(gsubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });
});
  it('should concatMap many complex, all inners finite, and outer throws', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const a =   cold( '-#                                                          ');
    const asubs: string[] = [];
    const b =   cold(   '-#                                                        ');
    const bsubs: string[] = [];
    const c =   cold(        '-2--3--4--5----6-|                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3|                           ');
    const dsubs =          '                   ^       !                           ';
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs =          '                           ^           !               ';
    const f =   cold(                                                    '--|      ');
    const fsubs: string[] = [];
    const g =   cold(                                                      '---1-2|');
    const gsubs: string[] = [];
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g#               ');
    const e1subs =         '^                                      !               ';
    const expected =       '---2--3--4--5----6-----2--3-1------2--3#               ';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.pipe(concatMap((value) => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(a).toBe(asubs);
    expectSubscriptionsTo(b).toBe(bsubs);
    expectSubscriptionsTo(c).toBe(csubs);
    expectSubscriptionsTo(d).toBe(dsubs);
    expectSubscriptionsTo(e).toBe(esubs);
    expectSubscriptionsTo(f).toBe(fsubs);
    expectSubscriptionsTo(g).toBe(gsubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many complex, all inners complete except one throws', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const a =   cold( '-#                                                          ');
    const asubs: string[] = [];
    const b =   cold(   '-#                                                        ');
    const bsubs: string[] = [];
    const c =   cold(        '-2--3--4--5----6-#                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3|                           ');
    const dsubs: string[] = [];
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs: string[] = [];
    const f =   cold(                                                    '--|      ');
    const fsubs: string[] = [];
    const g =   cold(                                                      '---1-2|');
    const gsubs: string[] = [];
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|               ');
    const e1subs =         '^                  !                                   ';
    const expected =       '---2--3--4--5----6-#                                   ';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.pipe(concatMap((value) => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(a).toBe(asubs);
    expectSubscriptionsTo(b).toBe(bsubs);
    expectSubscriptionsTo(c).toBe(csubs);
    expectSubscriptionsTo(d).toBe(dsubs);
    expectSubscriptionsTo(e).toBe(esubs);
    expectSubscriptionsTo(f).toBe(fsubs);
    expectSubscriptionsTo(g).toBe(gsubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many complex, all inners finite, outer is unsubscribed early', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const a =   cold( '-#                                                          ');
    const asubs: string[] = [];
    const b =   cold(   '-#                                                        ');
    const bsubs: string[] = [];
    const c =   cold(        '-2--3--4--5----6-|                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3|                           ');
    const dsubs =          '                   ^       !                           ';
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs =          '                           ^  !                        ';
    const f =   cold(                                                    '--|      ');
    const fsubs: string[] = [];
    const g =   cold(                                                      '---1-2|');
    const gsubs: string[] = [];
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|               ');
    const e1subs =         '^                             !                        ';
    const unsub =          '                              !                        ';
    const expected =       '---2--3--4--5----6-----2--3-1--                        ';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.pipe(concatMap((value) => observableLookup[value]));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptionsTo(a).toBe(asubs);
    expectSubscriptionsTo(b).toBe(bsubs);
    expectSubscriptionsTo(c).toBe(csubs);
    expectSubscriptionsTo(d).toBe(dsubs);
    expectSubscriptionsTo(e).toBe(esubs);
    expectSubscriptionsTo(f).toBe(fsubs);
    expectSubscriptionsTo(g).toBe(gsubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const a =   cold( '-#                                                          ');
    const asubs: string[] = [];
    const b =   cold(   '-#                                                        ');
    const bsubs: string[] = [];
    const c =   cold(        '-2--3--4--5----6-|                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3|                           ');
    const dsubs =          '                   ^       !                           ';
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs =          '                           ^  !                        ';
    const f =   cold(                                                    '--|      ');
    const fsubs: string[] = [];
    const g =   cold(                                                      '---1-2|');
    const gsubs: string[] = [];
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|               ');
    const e1subs =         '^                             !                        ';
    const unsub =          '                              !                        ';
    const expected =       '---2--3--4--5----6-----2--3-1--                        ';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.pipe(
      mergeMap(x => of(x)),
      concatMap(value => observableLookup[value]),
      mergeMap(x => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptionsTo(a).toBe(asubs);
    expectSubscriptionsTo(b).toBe(bsubs);
    expectSubscriptionsTo(c).toBe(csubs);
    expectSubscriptionsTo(d).toBe(dsubs);
    expectSubscriptionsTo(e).toBe(esubs);
    expectSubscriptionsTo(f).toBe(fsubs);
    expectSubscriptionsTo(g).toBe(gsubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many complex, all inners finite, project throws', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const a =   cold( '-#                                                          ');
    const asubs: string[] = [];
    const b =   cold(   '-#                                                        ');
    const bsubs: string[] = [];
    const c =   cold(        '-2--3--4--5----6-|                                   ');
    const csubs =          '  ^                !                                   ';
    const d =   cold(                         '----2--3|                           ');
    const dsubs =          '                   ^       !                           ';
    const e =   cold(                                 '-1------2--3-4-5---|        ');
    const esubs: string[] = [];
    const f =   cold(                                                    '--|      ');
    const fsubs: string[] = [];
    const g =   cold(                                                      '---1-2|');
    const gsubs: string[] = [];
    const e1 =   hot('-a-b--^-c-----d------e----------------f-----g|               ');
    const e1subs =         '^                          !                           ';
    const expected =       '---2--3--4--5----6-----2--3#                           ';
    const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    const result = e1.pipe(
      concatMap((value) => {
      if (value === 'e') { throw 'error'; }
      return observableLookup[value];
    })
  );

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(a).toBe(asubs);
    expectSubscriptionsTo(b).toBe(bsubs);
    expectSubscriptionsTo(c).toBe(csubs);
    expectSubscriptionsTo(d).toBe(dsubs);
    expectSubscriptionsTo(e).toBe(esubs);
    expectSubscriptionsTo(f).toBe(fsubs);
    expectSubscriptionsTo(g).toBe(gsubs);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  function arrayRepeat(value: string, times: number) {
    let results = [];
    for (let i = 0; i < times; i++) {
      results.push(value);
    }
    return results;
  }

  it('should concatMap many outer to an array for each value', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^                               !';
    const expected = '(22)--(4444)---(333)----(22)----|';

    const result = e1.pipe(concatMap((value) => arrayRepeat(value, +value)));

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many outer to inner arrays, outer unsubscribed early', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^            !                   ';
    const unsub =    '             !                   ';
    const expected = '(22)--(4444)--                   ';

    const result = e1.pipe(concatMap((value) => arrayRepeat(value, +value)));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should concatMap many outer to inner arrays, project throws', () => {     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^              !                 ';
    const expected = '(22)--(4444)---#                 ';

    let invoked = 0;
    const result = e1.pipe(concatMap((value) => {
      invoked++;
      if (invoked === 3) {
        throw 'error';
      }
      return arrayRepeat(value, +value);
    })
  );

    expectObservable(result).toBe(expected);
    expectSubscriptionsTo(e1).toBe(e1subs);
  });});

  it('should map values to constant resolved promises and concatenate', (done: MochaDone) => {
    const source = from([4, 3, 2, 1]);
    const project = (value: number) => from(Promise.resolve(42));

    const results: number[] = [];
    source.pipe(concatMap(project)).subscribe(
      (x) => {
        results.push(x);
      }, (err) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      }, () => {
        expect(results).to.deep.equal([42, 42, 42, 42]);
        done();
      });
  });

  it('should map values to constant rejected promises and concatenate', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = (value: any) => from(Promise.reject(42));

    source.pipe(concatMap(project)).subscribe(
      (x) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      }, (err) => {
        expect(err).to.deep.equal(42);
        done();
      }, () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      });
  });

  it('should map values to resolved promises and concatenate', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = (value: number, index: number) => from(Promise.resolve(value + index));

    const results: number[] = [];
    source.pipe(concatMap(project)).subscribe(
      (x) => {
        results.push(x);
      }, (err) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      }, () => {
        expect(results).to.deep.equal([4, 4, 4, 4]);
        done();
      });
  });

  it('should map values to rejected promises and concatenate', (done) => {
    const source = from([4, 3, 2, 1]);
    const project = (value: number, index: number) => from(Promise.reject('' + value + '-' + index));

    source.pipe(concatMap(project)).subscribe(
      (x) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      }, (err) => {
        expect(err).to.deep.equal('4-0');
        done();
      }, () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      });
  });
});
