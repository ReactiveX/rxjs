// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/sequenceEqual-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { sequenceEqual } from 'rxjs/sequence-equal';
describe('sequenceEqual (cold)', () => {
  it('should return true for two equal sequences', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot('--a--^--b--c--d--e--f--g--|       ');
      const s1subs = '     ^--------------------!       ';
      const s2 = hot('-----^-----b--c--d-e-f------g-|   ');
      const s2subs = '     ^------------------------!   ';
      const expected = '   -------------------------(T|)';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
      expectSubscriptions(s1.subscriptions).toBe(s1subs);
      expectSubscriptions(s2.subscriptions).toBe(s2subs);
    });
  });
  it('should return false for two sync observables that are unequal in length', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ cold, expectObservable }) => {
      const s1 = cold(' (abcdefg|)');
      const s2 = cold(' (abc|)    ');
      const expected = '(F|)      ';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
    });
  });
  it('should return true for two sync observables that match', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ cold, expectObservable }) => {
      const s1 = cold(' (abcdefg|)');
      const s2 = cold(' (abcdefg|)');
      const expected = '(T|)      ';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
    });
  });
  it('should return true for two observables that match when the last one emits and completes in the same frame', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot('--a--^--b--c--d--e--f--g--|       ');
      const s1subs = '     ^--------------------!       ';
      const s2 = hot('-----^--b--c--d--e--f--g------|   ');
      const s2subs = '     ^------------------------!   ';
      const expected = '   -------------------------(T|)';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
      expectSubscriptions(s1.subscriptions).toBe(s1subs);
      expectSubscriptions(s2.subscriptions).toBe(s2subs);
    });
  });
  it('should return true for two observables that match when the last one emits and completes in the same frame', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot('--a--^--b--c--d--e--f--g--|       ');
      const s1subs = '     ^--------------------!       ';
      const s2 = hot('-----^--b--c--d--e--f---------(g|)');
      const s2subs = '     ^------------------------!   ';
      const expected = '   -------------------------(T|)';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
      expectSubscriptions(s1.subscriptions).toBe(s1subs);
      expectSubscriptions(s2.subscriptions).toBe(s2subs);
    });
  });
  it('should error with an errored source', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot('--a--^--b---c---#  ');
      const s2 = hot('--a--^--b---c-----|');
      const expected = '   -----------#  ';
      const sub = '        ^----------!  ';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
      expectSubscriptions(s1.subscriptions).toBe(sub);
      expectSubscriptions(s2.subscriptions).toBe(sub);
    });
  });
  it('should error with an errored compareTo', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot('--a--^--b---c-----|');
      const s2 = hot('--a--^--b---c---#  ');
      const expected = '   -----------#  ';
      const sub = '        ^----------!  ';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
      expectSubscriptions(s1.subscriptions).toBe(sub);
      expectSubscriptions(s2.subscriptions).toBe(sub);
    });
  });
  it('should error if the source is a throw', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ cold, expectObservable }) => {
      const s1 = cold(' #            ');
      const s2 = cold(' ---a--b--c--|');
      const expected = '#            ';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected);
    });
  });
  it('should never return if source is a never', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ cold, expectObservable }) => {
      const s1 = cold(' ------------');
      const s2 = cold(' --a--b--c--|');
      const expected = '------------';
      const source = s1[sequenceEqual](s2);
      expectObservable(source, '^-----------!').toBe(expected);
    });
  });
  it('should never return if compareTo is a never', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ cold, expectObservable }) => {
      const s1 = cold(' --a--b--c--|');
      const s2 = cold(' ------------');
      const expected = '------------';
      const source = s1[sequenceEqual](s2);
      expectObservable(source, '^-----------!').toBe(expected);
    });
  });
  it('should return false if source is empty and compareTo is not', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const s1 = cold(' |            ');
      const s1subs = '  (^!)          ';
      const s2 = cold(' ------a------');
      const s2subs = '  ^-----!      ';
      const expected = '------(F|)   ';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
      expectSubscriptions(s1.subscriptions).toBe(s1subs);
      expectSubscriptions(s2.subscriptions).toBe(s2subs);
    });
  });
  it('should return false if compareTo is empty and source is not', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const s1 = cold(' ------a------');
      const s2 = cold(' |            ');
      const expected = '------(F|)   ';
      const s1subs = '  ^-----!      ';
      const s2subs = '  (^!)         ';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
      expectSubscriptions(s1.subscriptions).toBe(s1subs);
      expectSubscriptions(s2.subscriptions).toBe(s2subs);
    });
  });
  it('should return never if compareTo is empty and source is never', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ cold, expectObservable }) => {
      const s1 = cold(' -');
      const s2 = cold(' |');
      const expected = '-';
      const source = s1[sequenceEqual](s2);
      expectObservable(source, '^!').toBe(expected);
    });
  });
  it('should return never if source is empty and compareTo is never', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ cold, expectObservable }) => {
      const s1 = cold(' |');
      const s2 = cold(' -');
      const expected = '-';
      const source = s1[sequenceEqual](s2);
      expectObservable(source, '^!').toBe(expected);
    });
  });
  it('should error if the comparator function errors', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: null,
        b: { value: 'bees knees' },
        c: { value: 'carpy dumb' },
        d: { value: 'derp' },
        x: { value: 'bees knees', foo: 'lol' },
        y: { value: 'carpy dumb', scooby: 'doo' },
        z: { value: 'derp', weCouldBe: 'dancin, yeah' },
      };
      const s1 = hot('--a--^--b-----c------d--|      ', values);
      const s1subs = '     ^------------!            ';
      const s2 = hot('-----^--------x---y---z-------|', values);
      const s2subs = '     ^------------!            ';
      const expected = '   -------------#            ';
      let i = 0;
      const source = s1[sequenceEqual](s2, (a, b) => {
        if (++i === 2) {
          throw new Error('shazbot');
        }
        return a.value === b.value;
      });
      expectObservable(source).toBe(expected, booleans, new Error('shazbot'));
      expectSubscriptions(s1.subscriptions).toBe(s1subs);
      expectSubscriptions(s2.subscriptions).toBe(s2subs);
    });
  });
  it('should use the provided comparator function', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: null,
        b: { value: 'bees knees' },
        c: { value: 'carpy dumb' },
        d: { value: 'derp' },
        x: { value: 'bees knees', foo: 'lol' },
        y: { value: 'carpy dumb', scooby: 'doo' },
        z: { value: 'derp', weCouldBe: 'dancin, yeah' },
      };
      const s1 = hot('--a--^--b-----c------d--|         ', values);
      const s1subs = '     ^------------------!         ';
      const s2 = hot('-----^--------x---y---z-------|   ', values);
      const s2subs = '     ^------------------------!   ';
      const expected = '   -------------------------(T|)';
      const source = s1[sequenceEqual](s2, (a, b) => a.value === b.value);
      expectObservable(source).toBe(expected, booleans);
      expectSubscriptions(s1.subscriptions).toBe(s1subs);
      expectSubscriptions(s2.subscriptions).toBe(s2subs);
    });
  });
  it('should return false for two unequal sequences, compareTo finishing last', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot('--a--^--b--c--d--e--f--g--|    ');
      const s1subs = '     ^--------------------!    ';
      const s2 = hot('-----^-----b--c--d-e-f------z-|');
      const s2subs = '     ^----------------------!   ';
      const expected = '   -----------------------(F|)';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
      expectSubscriptions(s1.subscriptions).toBe(s1subs);
      expectSubscriptions(s2.subscriptions).toBe(s2subs);
    });
  });
  it('should return false for two unequal sequences, early wrong value from source', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot('--a--^--b--c---x-----------|');
      const s1subs = '     ^---------!            ';
      const s2 = hot('-----^--b--c--d--e--f--|    ');
      const s2subs = '     ^---------!            ';
      const expected = '   ----------(F|)         ';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
      expectSubscriptions(s1.subscriptions).toBe(s1subs);
      expectSubscriptions(s2.subscriptions).toBe(s2subs);
    });
  });
  it('should return false when the source emits an extra value after the compareTo completes', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot('--a--^--b--c--d--e--f--g--h--|');
      const s1subs = '     ^-----------!            ';
      const s2 = hot('-----^--b--c--d-|             ');
      const s2subs = '     ^----------!             ';
      const expected = '   ------------(F|)         ';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
      expectSubscriptions(s1.subscriptions).toBe(s1subs);
      expectSubscriptions(s2.subscriptions).toBe(s2subs);
    });
  });
  it('should return false when the compareTo emits an extra value after the source completes', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot('--a--^--b--c--d-|             ');
      const s1subs = '     ^----------!             ';
      const s2 = hot('-----^--b--c--d--e--f--g--h--|');
      const s2subs = '     ^-----------!            ';
      const expected = '   ------------(F|)         ';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
      expectSubscriptions(s1.subscriptions).toBe(s1subs);
      expectSubscriptions(s2.subscriptions).toBe(s2subs);
    });
  });
  it('should return true for two empty observables', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ cold, expectObservable }) => {
      const s1 = cold(' |   ');
      const s2 = cold(' |   ');
      const expected = '(T|)';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
    });
  });
  it('should return false for an empty observable and an observable that emits', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ cold, expectObservable }) => {
      const s1 = cold(' |      ');
      const s2 = cold(' ---a--|');
      const expected = '---(F|)';
      const source = s1[sequenceEqual](s2);
      expectObservable(source).toBe(expected, booleans);
    });
  });
  it('should return compare hot and cold observables', async () => {
    const booleans = { T: true, F: false };
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const s1 = hot('---a--^---b---c---d---e---f---g---h---i---j---|   ');
      const s2 = cold('     ----b---c-|                                 ');
      const s2subs = '      ^---------!                                 ';
      const expected1 = '   ------------(F|)                            ';
      const s3 = cold('                        -f---g---h---i---j---|   ');
      const test2subs = '   -------------------^                        ';
      const expected2 = '   ----------------------------------------(T|)';
      const s3subs = '      -------------------^--------------------!   ';
      const test1 = s1[sequenceEqual](s2);
      const test2 = s1[sequenceEqual](s3);
      expectObservable(test1).toBe(expected1, booleans);
      expectObservable(test2, test2subs).toBe(expected2, booleans);
      expectSubscriptions(s2.subscriptions).toBe(s2subs);
      expectSubscriptions(s3.subscriptions).toBe(s3subs);
    });
  });
});
