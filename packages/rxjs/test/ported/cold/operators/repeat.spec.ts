// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/repeat-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { repeat } from 'rxjs/repeat';
import { timer } from 'rxjs/timer';
describe('repeat (cold)', () => {
  it('should resubscribe count number of times', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--b--|                ');
      const subs = [
        '               ^-------!                ', //
        '               --------^-------!        ',
        '               ----------------^-------!',
      ];
      const expected = '--a--b----a--b----a--b--|';
      expectObservable(e1[repeat]({ count: 3 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should resubscribe multiple times', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--b--|                        ');
      const subs = [
        '               ^-------!                        ',
        '               --------^-------!                ',
        '               ----------------^-------!        ',
        '               ------------------------^-------!',
      ];
      const expected = '--a--b----a--b----a--b----a--b--|';
      expectObservable(e1[repeat]({ count: 2 })[repeat]({ count: 2 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should complete without emit when count is zero', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('--a--b--|');
      const subs = [];
      const expected = '|';
      expectObservable(e1[repeat]({ count: 0 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should emit source once when count is one', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--b--|');
      const subs = '    ^-------!';
      const expected = '--a--b--|';
      expectObservable(e1[repeat]({ count: 1 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should repeat until gets unsubscribed', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--b--|      ');
      const subs = [
        '               ^-------!      ', //
        '               --------^------!',
      ];
      const unsub = '   ---------------!';
      const expected = '--a--b----a--b-';
      expectObservable(e1[repeat]({ count: 10 }), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should be able to repeat indefinitely until unsubscribed', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--b--|                                    ');
      const subs = [
        '               ^-------!                                    ',
        '               --------^-------!                            ',
        '               ----------------^-------!                    ',
        '               ------------------------^-------!            ',
        '               --------------------------------^-------!    ',
        '               ----------------------------------------^---!',
      ];
      const unsub = '   --------------------------------------------!';
      const expected = '--a--b----a--b----a--b----a--b----a--b----a--';
      expectObservable(e1[repeat](), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--b--|                                    ');
      const subs = [
        '               ^-------!                                    ',
        '               --------^-------!                            ',
        '               ----------------^-------!                    ',
        '               ------------------------^-------!            ',
        '               --------------------------------^-------!    ',
        '               ----------------------------------------^---!',
      ];
      const unsub = '   --------------------------------------------!';
      const expected = '--a--b----a--b----a--b----a--b----a--b----a--';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [repeat]()
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should consider negative count as no repeat, and return EMPTY', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('--a--b--|                                    ');
      const expected = '|';
      expectObservable(e1[repeat]({ count: -1 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe([]);
    });
  });
  it('should not complete when source never completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('-');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[repeat]({ count: 3 }), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete when source does not completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('-');
      const unsub = '------------------------------!';
      const subs = ' ^-----------------------------!';
      const expected = '-';
      expectObservable(e1[repeat]({ count: 3 }), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should complete immediately when source does not complete without emit but count is zero', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('-');
      const subs = [];
      const expected = '|';
      expectObservable(e1[repeat]({ count: 0 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should complete immediately when source does not complete but count is zero', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('--a--b--');
      const subs = [];
      const expected = '|';
      expectObservable(e1[repeat]({ count: 0 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should emit source once and does not complete when source emits but does not complete', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--b--');
      const subs = ['^-------!'];
      const expected = '--a--b--';
      expectObservable(e1[repeat]({ count: 3 }), '^-------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should complete when source is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('|');
      const e1subs = ['(^!)', '(^!)', '(^!)'];
      const expected = '|';
      expectObservable(e1[repeat]({ count: 3 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete when source does not emit', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('----|        ');
      const subs = [
        '              ^---!        ', //
        '              ----^---!    ',
        '              --------^---!',
      ];
      const expected = '------------|';
      expectObservable(e1[repeat]({ count: 3 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should complete immediately when source does not emit but count is zero', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('----|');
      const subs = [];
      const expected = '|';
      expectObservable(e1[repeat]({ count: 0 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should raise error when source raises error', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--b--#');
      const subs = '    ^-------!';
      const expected = '--a--b--#';
      expectObservable(e1[repeat]({ count: 2 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should raises error if source throws', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('#');
      const e1subs = '(^!)';
      const expected = '#';
      expectObservable(e1[repeat]({ count: 3 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raises error if source throws when repeating infinitely', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('#');
      const e1subs = '(^!)';
      const expected = '#';
      expectObservable(e1[repeat]()).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error after first emit succeed', async () => {
    await rxTest(({ cold, expectObservable }) => {
      let repeated = false;
      const e1 = cold('--a--|')[map]((x) => {
        if (repeated) {
          throw 'error';
        } else {
          repeated = true;
          return x;
        }
      });
      const expected = '--a----#';
      expectObservable(e1[repeat]({ count: 2 })).toBe(expected);
    });
  });
  it('should allow count configuration', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--b--|                ');
      const subs = [
        '               ^-------!                ', //
        '               --------^-------!        ',
        '               ----------------^-------!',
      ];
      const expected = '--a--b----a--b----a--b--|';
      expectObservable(e1[repeat]({ count: 3 })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should allow delay time configuration', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--b--|                ');
      const delay = 3; //       ---|       ---|
      const subs = [
        '               ^-------!                ', //
        '               -----------^-------!        ',
        '               ----------------------^-------!',
      ];
      const expected = '--a--b-------a--b-------a--b--|';
      expectObservable(e1[repeat]({ count: 3, delay })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should allow delay function configuration', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const expectedCounts = [1, 2, 3];
      const e1 = cold(' --a--b--|                ');
      const delay = 3; //       ---|       ---|
      const subs = [
        '               ^-------!                ', //
        '               -----------^-------!        ',
        '               ----------------------^-------!',
      ];
      const expected = '--a--b-------a--b-------a--b--|';
      expectObservable(
        e1[repeat]({
          count: 3,
          delay: (count) => {
            expect(count).toBe(expectedCounts.shift());
            return ColdObservable[timer](delay);
          },
        })
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle delay function throwing', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const expectedCounts = [1, 2, 3];
      const e1 = cold(' --a--b--|                ');
      const delay = 3; //       ---|       ---|
      const subs = [
        '               ^-------!                ', //
        '               -----------^-------!        ',
      ];
      const expected = '--a--b-------a--b--#';
      expectObservable(
        e1[repeat]({
          count: 3,
          delay: (count) => {
            if (count === 2) {
              throw 'bad';
            }
            return ColdObservable[timer](delay);
          },
        })
      ).toBe(expected, undefined, 'bad');
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
});
