// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/concatMap-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
describe('concatMap (cold)', () => {
  it('should map-and-flatten each item to an Observable', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   --1-----3--5-------|');
      const e1subs = '   ^------------------!';
      const e2 = cold('  x-x-x|              ', { x: 10 });
      const expected = ' --x-x-x-y-y-yz-z-z-|';
      const values = { x: 10, y: 30, z: 50 };
      const result = e1[mergeMap]((x) => e2[map]((i) => i * parseInt(x)), { concurrent: 1 });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatenate many regular interval inners', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('  --a-a-a-(a|)                            ');
      const asubs = '   ^-------!                               ';
      const b = cold('          ----b--b--(b|)                  ');
      const bsubs = '   --------^---------!                     ';
      const c = cold('                           -c-c-(c|)      ');
      const csubs = '   -------------------------^----!         ';
      const d = cold('                                ------(d|)');
      const dsubs = '   ------------------------------^-----!   ';
      const e1 = hot('  a---b--------------------c-d----|       ');
      const e1subs = '  ^-------------------------------!       ';
      const expected = '--a-a-a-a---b--b--b-------c-c-c-----(d|)';
      const observableLookup = { a: a, b: b, c: c, d: d };
      const source = e1[mergeMap]((value) => observableLookup[value], { concurrent: 1 });
      expectObservable(source).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
      expectSubscriptions(b.subscriptions).toBe(bsubs);
      expectSubscriptions(c.subscriptions).toBe(csubs);
      expectSubscriptions(d.subscriptions).toBe(dsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatMap many outer values to many inner values', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---|                        ');
      const e1subs = '    ^----------------!                        ';
      const inner = cold(' --i-j-k-l-|                              ', values);
      const innersubs = [
        '                 -^---------!                              ',
        '                 -----------^---------!                    ',
        '                 ---------------------^---------!          ',
        '                 -------------------------------^---------!',
      ];
      const expected = '  ---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l-|';
      const result = e1[mergeMap]((value) => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an empty source', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('   |');
      const e1subs = '    (^!)';
      const inner = cold('-1-2-3|');
      const innersubs = [];
      const expected = '  |';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a never source', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('   -');
      const e1subs = '^!';
      const inner = cold('-1-2-3|');
      const innersubs = [];
      const expected = '  -';
      const result = e1[mergeMap](
        () => {
          return inner;
        },
        { concurrent: 1 }
      );
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should error immediately if given a just-throw source', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('   #');
      const e1subs = '    (^!)';
      const inner = cold('-1-2-3|');
      const innersubs = [];
      const expected = '  #';
      const result = e1[mergeMap](
        () => {
          return inner;
        },
        { concurrent: 1 }
      );
      expectObservable(result).toBe(expected);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return a silenced version of the source if the mapped inner is empty', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('   --a-b--c-| ');
      const e1subs = '    ^--------! ';
      const inner = cold('  |');
      // prettier-ignore
      const innersubs = [
                '                 --(^!)     ',
                '                 ----(^!)   ',
                '                 -------(^!)',
            ];
      const expected = '  ---------| ';
      const result = e1[mergeMap](
        () => {
          return inner;
        },
        { concurrent: 1 }
      );
      expectObservable(result).toBe(expected);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return a never if the mapped inner is never', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --a-b--c-|');
      const e1subs = '   ^--------!';
      const inner = cold(' -');
      const innersubs = '--^-------!';
      const expected = ' ----------';
      const result = e1[mergeMap](
        () => {
          return inner;
        },
        { concurrent: 1 }
      );
      expectObservable(result, '^---------!').toBe(expected);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate errors if the mapped inner is a just-throw Observable', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  --a-b--c-|');
      const e1subs = '   ^-!       ';
      const inner = cold(' #');
      const innersubs = '--(^!)    ';
      const expected = ' --#       ';
      const result = e1[mergeMap](
        () => {
          return inner;
        },
        { concurrent: 1 }
      );
      expectObservable(result).toBe(expected);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatMap many outer to many inner, complete late', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d----------------------------------|');
      const e1subs = '    ^-----------------------------------------------!';
      const inner = cold(' --i-j-k-l-|                                     ', values);
      const innersubs = [
        '                 -^---------!                                     ',
        '                 -----------^---------!                           ',
        '                 ---------------------^---------!                 ',
        '                 -------------------------------^---------!       ',
      ];
      const expected = '  ---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l--------|';
      const result = e1[mergeMap]((value) => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatMap many outer to many inner, outer never completes', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d-----------------------------------');
      const e1subs = '^------------------------------------------------!';
      const inner = cold(' --i-j-k-l-|                                     ', values);
      const innersubs = [
        '                 -^---------!                                     ',
        '                 -----------^---------!                           ',
        '                 ---------------------^---------!                 ',
        '                 -------------------------------^---------!       ',
      ];
      const expected = '  ---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l---------';
      const result = e1[mergeMap]((value) => inner, { concurrent: 1 });
      expectObservable(result, '^------------------------------------------------!').toBe(expected, values);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatMap many outer to many inner, inner never completes', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---|');
      const e1subs = '    ^----------------!';
      const inner = cold(' --i-j-k-l-       ', values);
      const innersubs = '-^----------------!';
      const expected = '  ---i-j-k-l--------';
      const result = e1[mergeMap]((value) => inner, { concurrent: 1 });
      expectObservable(result, '^-----------------!').toBe(expected, values);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatMap many outer to many inner, and inner throws', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---|');
      const e1subs = '    ^----------!      ';
      const inner = cold(' --i-j-k-l-#      ', values);
      const innersubs = ' -^---------!      ';
      const expected = '  ---i-j-k-l-#      ';
      const result = e1[mergeMap](() => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatMap many outer to many inner, and outer throws', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---#');
      const e1subs = '    ^----------------!';
      const inner = cold(' --i-j-k-l-|      ', values);
      // prettier-ignore
      const innersubs = [
                '                 -^---------!      ',
                '                 -----------^-----!',
            ];
      const expected = '  ---i-j-k-l---i-j-#';
      const result = e1[mergeMap]((value) => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatMap many outer to many inner, both inner and outer throw', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
      const e1 = hot('    -a---b---c---d---#');
      const e1subs = '    ^----------!      ';
      const inner = cold(' --i-j-k-l-#      ', values);
      const innersubs = ' -^---------!      ';
      const expected = '  ---i-j-k-l-#      ';
      const result = e1[mergeMap]((value) => inner, { concurrent: 1 });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(inner.subscriptions).toBe(innersubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatMap many complex, where all inners are finite', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('   -#                                                          ');
      const asubs = [];
      const b = cold('     -#                                                        ');
      const bsubs = [];
      const c = cold('          -2--3--4--5----6-|                                   ');
      const csubs = '         --^----------------!                                   ';
      const d = cold('                           ----2--3|                           ');
      const dsubs = '         -------------------^-------!                           ';
      const e = cold('                                   -1------2--3-4-5---|        ');
      const esubs = '         ---------------------------^------------------!        ';
      const f = cold('                                                      --|      ');
      const fsubs = '         ----------------------------------------------^-!      ';
      const g = cold('                                                        ---1-2|');
      const gsubs = '         ------------------------------------------------^-----!';
      const e1 = hot('  -a-b--^-c-----d------e----------------f-----g|               ');
      const e1subs = '        ^--------------------------------------!               ';
      const expected = '      ---2--3--4--5----6-----2--3-1------2--3-4-5--------1-2|';
      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const result = e1[mergeMap]((value) => observableLookup[value], { concurrent: 1 });
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
  it('should concatMap many complex, all inners finite except one', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('   -#                                                          ');
      const asubs = [];
      const b = cold('     -#                                                        ');
      const bsubs = [];
      const c = cold('          -2--3--4--5----6-|                                   ');
      const csubs = '         --^----------------!                                   ';
      const d = cold('                           ----2--3-                           ');
      const dsubs = '-------------------^-----------------------------------!';
      const e = cold('                                   -1------2--3-4-5---|        ');
      const esubs = [];
      const f = cold('                                                      --|      ');
      const fsubs = [];
      const g = cold('                                                        ---1-2|');
      const gsubs = [];
      const e1 = hot('  -a-b--^-c-----d------e----------------f-----g|               ');
      const e1subs = '        ^--------------------------------------!               ';
      const expected = '      ---2--3--4--5----6-----2--3----------------------------';
      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const result = e1[mergeMap]((value) => observableLookup[value], { concurrent: 1 });
      expectObservable(result, '^------------------------------------------------------!').toBe(expected);
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
  it('should concatMap many complex, inners finite, outer does not complete', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('   -#                                                          ');
      const asubs = [];
      const b = cold('     -#                                                        ');
      const bsubs = [];
      const c = cold('          -2--3--4--5----6-|                                   ');
      const csubs = '         --^----------------!                                   ';
      const d = cold('                           ----2--3|                           ');
      const dsubs = '         -------------------^-------!                           ';
      const e = cold('                                   -1------2--3-4-5---|        ');
      const esubs = '         ---------------------------^------------------!        ';
      const f = cold('                                                      --|      ');
      const fsubs = '         ----------------------------------------------^-!      ';
      const g = cold('                                                        ---1-2|');
      const gsubs = '         ------------------------------------------------^-----!';
      const e1 = hot('  -a-b--^-c-----d------e----------------f-----g---             ');
      const e1subs = '^------------------------------------------------------!';
      const expected = '      ---2--3--4--5----6-----2--3-1------2--3-4-5--------1-2-';
      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const result = e1[mergeMap]((value) => observableLookup[value], { concurrent: 1 });
      expectObservable(result, '^------------------------------------------------------!').toBe(expected);
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
  it('should concatMap many complex, all inners finite, and outer throws', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('   -#                                                          ');
      const asubs = [];
      const b = cold('     -#                                                        ');
      const bsubs = [];
      const c = cold('          -2--3--4--5----6-|                                   ');
      const csubs = '         --^----------------!                                   ';
      const d = cold('                           ----2--3|                           ');
      const dsubs = '         -------------------^-------!                           ';
      const e = cold('                                   -1------2--3-4-5---|        ');
      const esubs = '         ---------------------------^-----------!               ';
      const f = cold('                                                      --|      ');
      const fsubs = [];
      const g = cold('                                                        ---1-2|');
      const gsubs = [];
      const e1 = hot('  -a-b--^-c-----d------e----------------f-----g#               ');
      const e1subs = '        ^--------------------------------------!               ';
      const expected = '      ---2--3--4--5----6-----2--3-1------2--3#               ';
      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const result = e1[mergeMap]((value) => observableLookup[value], { concurrent: 1 });
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
  it('should concatMap many complex, all inners complete except one throws', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('   -#                                                          ');
      const asubs = [];
      const b = cold('     -#                                                        ');
      const bsubs = [];
      const c = cold('          -2--3--4--5----6-#                                   ');
      const csubs = '         --^----------------!                                   ';
      const d = cold('                           ----2--3|                           ');
      const dsubs = [];
      const e = cold('                                   -1------2--3-4-5---|        ');
      const esubs = [];
      const f = cold('                                                      --|      ');
      const fsubs = [];
      const g = cold('                                                        ---1-2|');
      const gsubs = [];
      const e1 = hot('  -a-b--^-c-----d------e----------------f-----g|               ');
      const e1subs = '        ^------------------!                                   ';
      const expected = '      ---2--3--4--5----6-#                                   ';
      const observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
      const result = e1[mergeMap]((value) => observableLookup[value], { concurrent: 1 });
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
  it('should concatMap many complex, all inners finite, outer is unsubscribed early', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('   -#                                                          ');
      const asubs = [];
      const b = cold('     -#                                                        ');
      const bsubs = [];
      const c = cold('          -2--3--4--5----6-|                                   ');
      const csubs = '         --^----------------!                                   ';
      const d = cold('                           ----2--3|                           ');
      const dsubs = '         -------------------^-------!                           ';
      const e = cold('                                   -1------2--3-4-5---|        ');
      const esubs = '         ---------------------------^--!                        ';
      const f = cold('                                                      --|      ');
      const fsubs = [];
      const g = cold('                                                        ---1-2|');
      const gsubs = [];
      const e1 = hot('  -a-b--^-c-----d------e----------------f-----g|               ');
      const e1subs = '        ^-----------------------------!                        ';
      const unsub = '         ^-----------------------------!                        ';
      const expected = '      ---2--3--4--5----6-----2--3-1--                        ';
      const observableLookup = {
        a: a,
        b: b,
        c: c,
        d: d,
        e: e,
        f: f,
        g: g,
      };
      const result = e1[mergeMap]((value) => observableLookup[value], { concurrent: 1 });
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
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('   -#                                                          ');
      const asubs = [];
      const b = cold('   -#                                                          ');
      const bsubs = [];
      const c = cold('          -2--3--4--5----6-|                                   ');
      const csubs = '         --^----------------!                                   ';
      const d = cold('                           ----2--3|                           ');
      const dsubs = '         -------------------^-------!                           ';
      const e = cold('                                   -1------2--3-4-5---|        ');
      const esubs = '         ---------------------------^--!                        ';
      const f = cold('                                                      --|      ');
      const fsubs = [];
      const g = cold('                                                        ---1-2|');
      const gsubs = [];
      const e1 = hot('  -a-b--^-c-----d------e----------------f-----g|               ');
      const e1subs = '        ^-----------------------------!                        ';
      const unsub = '         ^-----------------------------!                        ';
      const expected = '      ---2--3--4--5----6-----2--3-1--                        ';
      const observableLookup = {
        a: a,
        b: b,
        c: c,
        d: d,
        e: e,
        f: f,
        g: g,
      };
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [mergeMap]((value) => observableLookup[value], { concurrent: 1 })
        [mergeMap]((x) => ColdObservable.from([x]));
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
  });
  it('should concatMap many complex, all inners finite, project throws', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const a = cold('   -#                                                          ');
      const asubs = [];
      const b = cold('     -#                                                        ');
      const bsubs = [];
      const c = cold('          -2--3--4--5----6-|                                   ');
      const csubs = '         --^----------------!                                   ';
      const d = cold('                           ----2--3|                           ');
      const dsubs = '         -------------------^-------!                           ';
      const e = cold('                                   -1------2--3-4-5---|        ');
      const esubs = [];
      const f = cold('                                                      --|      ');
      const fsubs = [];
      const g = cold('                                                        ---1-2|');
      const gsubs = [];
      const e1 = hot('  -a-b--^-c-----d------e----------------f-----g|               ');
      const e1subs = '        ^--------------------------!                           ';
      const expected = '      ---2--3--4--5----6-----2--3#                           ';
      const observableLookup = {
        a: a,
        b: b,
        c: c,
        d: d,
        e: e,
        f: f,
        g: g,
      };
      const result = e1[mergeMap](
        (value) => {
          if (value === 'e') {
            throw 'error';
          }
          return observableLookup[value];
        },
        { concurrent: 1 }
      );
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
  it('should concatMap many outer to an array for each value', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^-------------------------------!';
      const expected = '(22)--(4444)---(333)----(22)----|';
      const result = e1[mergeMap]((value) => arrayRepeat(value, +value), { concurrent: 1 });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatMap many outer to inner arrays, outer unsubscribed early', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^------------!                   ';
      const unsub = '   ^------------!                   ';
      const expected = '(22)--(4444)--                   ';
      const result = e1[mergeMap]((value) => arrayRepeat(value, +value), { concurrent: 1 });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should concatMap many outer to inner arrays, project throws', async () => {
    function arrayRepeat(value, times) {
      let results = [];
      for (let i = 0; i < times; i++) {
        results.push(value);
      }
      return results;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  2-----4--------3--------2-------|');
      const e1subs = '  ^--------------!                 ';
      const expected = '(22)--(4444)---#                 ';
      let invoked = 0;
      const result = e1[mergeMap](
        (value) => {
          invoked++;
          if (invoked === 3) {
            throw 'error';
          }
          return arrayRepeat(value, +value);
        },
        { concurrent: 1 }
      );
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
