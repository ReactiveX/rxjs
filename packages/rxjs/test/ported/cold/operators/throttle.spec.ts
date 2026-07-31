// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/throttle-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { throttle } from 'rxjs/throttle';
describe('throttle (cold)', () => {
  it('should immediately emit the first value in each time window', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-xy-----b--x--cxyz-|');
      const e1subs = '  ^--------------------!';
      const e2 = cold('  ----i                ');
      //                          ----i
      //                                ----i
      const e2subs = [
        '               -^---!                ',
        '               ----------^---!       ',
        '               ----------------^---! ',
      ];
      const expected = '-a--------b-----c----|';
      const result = e1[throttle](() => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should simply mirror the source if values are not emitted often enough', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ^a--------b-----c----|');
      const e1subs = '  ^--------------------!';
      const e2 = cold('  ----|                ');
      const e2subs = [
        '               -^---!                ',
        '               ----------^---!       ',
        '               ----------------^---! ',
      ];
      const expected = '-a--------b-----c----|';
      const result = e1[throttle](() => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should throttle with duration Observable using next to close the duration', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ^a-xy-----b--x--cxxx-|');
      const e1subs = '  ^--------------------!';
      const e2 = cold('  ----x-y-z            ');
      const e2subs = [
        '               -^---!                ',
        '               ----------^---!       ',
        '               ----------------^---! ',
      ];
      const expected = '-a--------b-----c----|';
      const result = e1[throttle](() => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should interrupt source and duration when result is unsubscribed early', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-x-y-z-xyz-x-y-z----b--x-x-|');
      const unsub = '   --------------!               ';
      const e1subs = '  ^-------------!               ';
      const e2 = cold('  ---------------------|       ');
      const e2subs = '  -^------------!               ';
      const expected = '-a-------------               ';
      const result = e1[throttle](() => e2);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-x-y-z-xyz-x-y-z----b--x-x-|');
      const e1subs = '  ^-------------!               ';
      const e2 = cold('  ------------------|           ');
      const e2subs = '  -^------------!               ';
      const expected = '-a-------------               ';
      const unsub = '   --------------!               ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [throttle](() => e2)
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle a busy producer emitting a regular repeating sequence', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^------------------------!';
      const e2 = cold(' -----|                    ');
      const e2subs = [
        '               ^----!                    ',
        '               ------^----!              ',
        '               ------------^----!        ',
        '               ------------------^----!  ',
        '               ------------------------^!',
      ];
      const expected = 'a-----a-----a-----a-----a|';
      const result = e1[throttle](() => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should mirror source if durations are immediate', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^------------------------!';
      const e2 = cold(' x                         ');
      const expected = 'abcdefabcdefabcdefabcdefa|';
      const result = e1[throttle](() => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mirror source if durations are empty', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^------------------------!';
      const e2 = cold(' |                         ');
      const expected = 'abcdefabcdefabcdefabcdefa|';
      const result = e1[throttle](() => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take only the first value emitted if duration is a never', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^----------------------------!';
      const e2 = cold(' -                             ');
      const e2subs = '  ----^------------------------!';
      const expected = '----a------------------------|';
      const result = e1[throttle](() => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should unsubscribe duration Observable when source raise error', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----abcdefabcdefabcdefabcdefa#');
      const e1subs = '  ^----------------------------!';
      const e2 = cold(' -                             ');
      const e2subs = '  ----^------------------------!';
      const expected = '----a------------------------#';
      const result = e1[throttle](() => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error as soon as just-throw duration is used', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^---!-------------------------';
      const e2 = cold(' #                             ');
      const e2subs = '  ----(^!)                      ';
      const expected = '----(a#)                      ';
      const result = e1[throttle](() => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should throttle using durations of varying lengths', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdabcdefghabca|   ');
      const e1subs = '  ^---------------------!   ';
      const e2 = [
        cold('          -----|                    '),
        cold('                ---|                '),
        cold('                    -------|        '),
        cold('                            --|     '),
        cold('                               ----|'),
      ];
      const e2subs = [
        '               ^----!                    ',
        '               ------^--!                ',
        '               ----------^------!        ',
        '               ------------------^-!     ',
        '               ---------------------^!   ',
      ];
      const expected = 'a-----a---a-------a--a|   ';
      let i = 0;
      const result = e1[throttle](() => e2[i++]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let j = 0; j < e2.length; j++) {
        expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
      }
    });
  });
  it('should propagate error from duration Observable', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdabcdefghabca|   ');
      const e1subs = '  ^----------------!        ';
      const e2 = [
        cold('          -----|                    '),
        cold('                ---|                '),
        cold('                    -------#        '),
      ];
      const e2subs = [
        '               ^----!                    ',
        '               ------^--!                ',
        '               ----------^------!        ',
      ];
      const expected = 'a-----a---a------#        ';
      let i = 0;
      const result = e1[throttle](() => e2[i++]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let j = 0; j < e2.length; j++) {
        expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
      }
    });
  });
  it('should propagate error thrown from durationSelector function', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot(' --^--x--x--x--x--x--x--e--x--x--x--|');
      const s1Subs = ' ^--------------------!              ';
      const n1 = cold('----|                               ');
      const n1Subs = [
        '              ---^---!                            ',
        '              ---------^---!                      ',
        '              ---------------^---!                ',
      ];
      const exp = '    ---x-----x-----x-----(e#)           ';
      let i = 0;
      const result = s1[throttle](() => {
        if (i++ === 3) {
          throw new Error('lol');
        }
        return n1;
      });
      expectObservable(result).toBe(exp, undefined, new Error('lol'));
      expectSubscriptions(s1.subscriptions).toBe(s1Subs);
      expectSubscriptions(n1.subscriptions).toBe(n1Subs);
    });
  });
  it('should complete when source does not emit', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|');
      const subs = '    ^----!';
      const expected = '-----|';
      function durationSelector() {
        return cold('-----|');
      }
      expectObservable(e1[throttle](durationSelector)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should raise error when source does not emit and raises error', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----#');
      const subs = '    ^----!';
      const expected = '-----#';
      function durationSelector() {
        return cold('-----|');
      }
      expectObservable(e1[throttle](durationSelector)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle an empty source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |     ');
      const subs = '    (^!)  ';
      const expected = '|     ';
      function durationSelector() {
        return cold('-----|');
      }
      expectObservable(e1[throttle](durationSelector)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle a never source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -     ');
      const subs = '^!';
      const expected = '-     ';
      function durationSelector() {
        return cold('-----|');
      }
      expectObservable(e1[throttle](durationSelector), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle a throw source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #     ');
      const subs = '    (^!)  ';
      const expected = '#     ';
      function durationSelector() {
        return cold('-----|');
      }
      expectObservable(e1[throttle](durationSelector)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should immediately emit the first value in each time window', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-xy-----b--x--cxxx------|');
      const e1subs = '  ^-------------------------!';
      const e2 = cold('  ----x                     ');
      const e2subs = [
        '               -^---!                     ',
        '               -----^---!                 ',
        '               ----------^---!            ',
        '               --------------^---!        ',
        '               ------------------^---!    ',
        '               ----------------------^---!',
      ];
      const expected = '-a---y----b---x---x---x---|';
      const result = e1[throttle](() => e2, { trailing: true });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work for individual values', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot('-^-x------------------|     ');
      const s1Subs = ' ^--------------------!     ';
      const n1 = cold('  ------------------------|');
      const n1Subs = ['--^------------------!     '];
      const exp = '    --x------------------|     ';
      const result = s1[throttle](() => n1, { trailing: true });
      expectObservable(result).toBe(exp);
      expectSubscriptions(s1.subscriptions).toBe(s1Subs);
      expectSubscriptions(n1.subscriptions).toBe(n1Subs);
    });
  });
  it('should emit trailing value after throttle duration when source completes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--------xy|     ');
      const e1subs = '  ^-----------!     ';
      const e2 = cold('  ----x            ');
      const e2subs = [
        // because prettier
        '               -^---!            ',
        '               ----------^---!   ',
      ];
      const expected = '-a--------x---(y|)';
      const result = e1[throttle](() => e2, { trailing: true });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should immediately emit the first value in each time window', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-xy-----b--x--cxxx------|');
      const e1subs = '  ^-------------------------!';
      const e2 = cold('  ----x                     ');
      const e2subs = [
        '               -^---!                     ',
        '               -----^---!                 ',
        '               ----------^---!            ',
        '               --------------^---!        ',
        '               ------------------^---!    ',
        '               ----------------------^---!',
      ];
      const expected = '-----y--------x---x---x---|';
      const result = e1[throttle](() => e2, { leading: false, trailing: true });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work for individual values', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot('-^-x------------------|        ');
      const s1Subs = ' ^--------------------!        ';
      const n1 = cold('  ------------------------x   ');
      const n1Subs = ['--^-----------------------!   '];
      const exp = '    --------------------------(x|)';
      const result = s1[throttle](() => n1, { leading: false, trailing: true });
      expectObservable(result).toBe(exp);
      expectSubscriptions(s1.subscriptions).toBe(s1Subs);
      expectSubscriptions(n1.subscriptions).toBe(n1Subs);
    });
  });
  it('should wait for trailing throttle before completing, even if source completes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = hot('  -^--x--------y---------|        ');
      const sourceSubs = '   ^---------------------!        ';
      const duration = cold('   ------------------------x   ');
      const durationSubs = ' ---^-----------------------!   ';
      const exp = '          ---------------------------(y|)';
      const result = source[throttle](() => duration, { leading: false, trailing: true });
      expectObservable(result).toBe(exp);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(duration.subscriptions).toBe(durationSubs);
    });
  });
  it('should emit trailing value after throttle duration when source completes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--------x|   ');
      const e1subs = '  ^----------!   ';
      const e2 = cold('  ----x         ');
      const e2subs = [
        // because prettier
        '               -^---!         ',
        '               -----^---!     ',
        '               ----------^---!',
      ];
      const expected = '-----a--------(x|)';
      const result = e1[throttle](() => e2, { leading: false, trailing: true });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit the last trailing value after throttle duration when source completes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--------xy|  ');
      const e1subs = '  ^-----------!  ';
      const e2 = cold('  ----x         ');
      const e2subs = [
        // because prettier
        '               -^---!         ',
        '               -----^---!     ',
        '               ----------^---!',
      ];
      const expected = '-----a--------(y|)';
      const result = e1[throttle](() => e2, { leading: false, trailing: true });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should complete when source completes if no value is available', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-----|');
      const e1subs = '  ^------!';
      const e2 = cold('  ----x  ');
      const e2subs = [
        // because prettier
        '               -^---!  ',
        '               -----^-!',
      ];
      const expected = '-----a-|';
      const result = e1[throttle](() => e2, { leading: false, trailing: true });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
