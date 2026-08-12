// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/partition-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { partition } from 'rxjs/partition';
describe('partition (cold)', () => {
  it('should partition an observable of integers into even and odd', async () => {
    await rxTest(({ hot, expectSubscriptions, expectObservable }) => {
      const e1 = hot('   --1-2---3------4--5---6--|');
      const e1subs = '   ^------------------------!';
      // prettier-ignore
      const expected = [
                '                --1-----3---------5------|',
                '                ----2----------4------6--|',
            ];
      const result = ColdObservable[partition](e1, (x) => x % 2 === 1);
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1]).toBe(expected_1[index_1]);
        }
      })(result, expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should partition an observable into two using a predicate', async () => {
    await rxTest(({ hot, expectSubscriptions, expectObservable }) => {
      const e1 = hot('   --a-b---a------d--a---c--|');
      const e1subs = '   ^------------------------!';
      // prettier-ignore
      const expected = [
                '                --a-----a---------a------|',
                '                ----b----------d------c--|',
            ];
      function predicate(x) {
        return x === 'a';
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1]).toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should partition an observable into two using a predicate that takes an index', async () => {
    await rxTest(({ hot, expectSubscriptions, expectObservable }) => {
      const e1 = hot('   --a-b---a------d--a---c--|');
      const e1subs = '   ^------------------------!';
      // prettier-ignore
      const expected = [
                '                --a-----a---------a------|',
                '                ----b----------d------c--|',
            ];
      function predicate(value, index) {
        return index % 2 === 0;
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1]).toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should partition an observable into two using a bound predicate', async () => {
    await rxTest(({ hot, expectSubscriptions, expectObservable }) => {
      const e1 = hot('   --a-b---a------d--a---c--|');
      const e1subs = '   ^------------------------!';
      // prettier-ignore
      const expected = [
                '                --a-----a---------a------|',
                '                ----b----------d------c--|',
            ];
      function predicate(x) {
        return x === this.value;
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1]).toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate.bind({ value: 'a' })), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should pass errors to both returned observables', async () => {
    await rxTest(({ hot, expectSubscriptions, expectObservable }) => {
      const e1 = hot('   --a-b---#');
      const e1subs = '   ^-------!';
      // prettier-ignore
      const expected = [
                '                --a-----#',
                '                ----b---#',
            ];
      function predicate(x) {
        return x === 'a';
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1]).toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should pass errors to both returned observables if source throws', async () => {
    await rxTest(({ cold, expectSubscriptions, expectObservable }) => {
      const e1 = cold('  #   ');
      const e1subs = '   (^!)';
      // prettier-ignore
      const expected = [
                '                 #  ',
                '                 #  ',
            ];
      function predicate(x) {
        return x === 'a';
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1]).toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should pass errors to both returned observables if predicate throws', async () => {
    await rxTest(({ hot, expectSubscriptions, expectObservable }) => {
      const e1 = hot('   --a-b--a--|');
      const e1subs = '   ^------!   ';
      // prettier-ignore
      const expected = [
                '                --a----#   ',
                '                ----b--#   ',
            ];
      let index = 0;
      const error = 'error';
      function predicate(x) {
        const match = x === 'a';
        if (match && index++ > 1) {
          throw error;
        }
        return match;
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1]).toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should partition empty observable if source does not emits', async () => {
    await rxTest(({ hot, expectSubscriptions, expectObservable }) => {
      const e1 = hot('   ----|');
      const e1subs = '   ^---!';
      // prettier-ignore
      const expected = [
                '                ----|',
                '                ----|',
            ];
      function predicate(x) {
        return x === 'x';
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1]).toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should partition empty observable if source is empty', async () => {
    await rxTest(({ cold, expectSubscriptions, expectObservable }) => {
      const e1 = cold('  |   ');
      const e1subs = '   (^!)';
      // prettier-ignore
      const expected = [
                '                |   ',
                '                |   ',
            ];
      function predicate(x) {
        return x === 'x';
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1]).toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should partition if source emits single elements', async () => {
    await rxTest(({ hot, expectSubscriptions, expectObservable }) => {
      const e1 = hot('   --a--|');
      const e1subs = '   ^----!';
      // prettier-ignore
      const expected = [
                '                --a--|',
                '                -----|',
            ];
      function predicate(x) {
        return x === 'a';
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1]).toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should partition if predicate matches all of source elements', async () => {
    await rxTest(({ hot, expectSubscriptions, expectObservable }) => {
      const e1 = hot('   --a--a--a--a--a--a--a--|');
      const e1subs = '   ^----------------------!';
      // prettier-ignore
      const expected = [
                '                --a--a--a--a--a--a--a--|',
                '                -----------------------|',
            ];
      function predicate(x) {
        return x === 'a';
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1]).toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should partition if predicate does not match all of source elements', async () => {
    await rxTest(({ hot, expectSubscriptions, expectObservable }) => {
      const e1 = hot('   --b--b--b--b--b--b--b--|');
      const e1subs = '   ^----------------------!';
      // prettier-ignore
      const expected = [
                '                -----------------------|',
                '                --b--b--b--b--b--b--b--|',
            ];
      function predicate(x) {
        return x === 'a';
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1]).toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should partition to infinite observable if source does not completes', async () => {
    await rxTest(({ hot, expectSubscriptions, expectObservable }) => {
      const e1 = hot('   --a-b---a------d----');
      const e1subs = '^-------------------!';
      // prettier-ignore
      const expected = [
                '                --a-----a-----------',
                '                ----b----------d----',
            ];
      function predicate(x) {
        return x === 'a';
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1], '^-------------------!').toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should partition to infinite observable if source never completes', async () => {
    await rxTest(({ cold, expectSubscriptions, expectObservable }) => {
      const e1 = cold('  -');
      const e1subs = '^!';
      // prettier-ignore
      const expected = [
                '                -',
                '                -',
            ];
      function predicate(x) {
        return x === 'a';
      }
      ((result_1, expected_1) => {
        for (let index_1 = 0; index_1 < result_1.length; index_1++) {
          expectObservable(result_1[index_1], '^!').toBe(expected_1[index_1]);
        }
      })(ColdObservable[partition](e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should partition into two observable with early unsubscription', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   --a-b---a------d-|');
      const unsub = '    -------!          ';
      const e1subs = '   ^------!          ';
      // prettier-ignore
      const expected = [
                '                --a-----          ',
                '                ----b---          ',
            ];
      function predicate(x) {
        return x === 'a';
      }
      const result = ColdObservable[partition](e1, predicate);
      for (let idx = 0; idx < result.length; idx++) {
        expectObservable(result[idx], unsub).toBe(expected[idx]);
      }
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   --a-b---a------d-|');
      const e1subs = '   ^------!          ';
      // prettier-ignore
      const expected = [
                '                --a-----          ',
                '                ----b---          ',
            ];
      const unsub = '    -------!          ';
      const e1Pipe = e1[mergeMap]((x) => ColdObservable.from([x]));
      const result = ColdObservable[partition](e1Pipe, (x) => x === 'a');
      expectObservable(result[0], unsub).toBe(expected[0]);
      expectObservable(result[1], unsub).toBe(expected[1]);
      expectSubscriptions(e1.subscriptions).toBe([e1subs]);
    });
  });
});
