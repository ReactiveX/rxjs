// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/audit-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { EMPTY } from 'rxjs/empty';
import { mergeMap } from 'rxjs/merge-map';
import { throttle } from 'rxjs/throttle';
describe('audit (cold)', () => {
  it('should emit the last value in each time window', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
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
      const expected = '-----y--------x-----z|';
      const result = e1[throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should delay the source if values are not emitted often enough', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--------b-----c----|');
      const e1subs = '  ^--------------------!';
      const e2 = cold('  ----x                ');
      const e2subs = [
        '               -^---!                ',
        '               ----------^---!       ',
        '               ----------------^---! ',
      ];
      const expected = '-----a--------b-----c|';
      const result = e1[throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should audit with duration Observable using next to close the duration', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   -a-xy-----b--x--cxxx-|');
      const e1subs = '   ^--------------------!';
      const e2 = cold('   ----x-y-z            ');
      const e2subs = [
        '                -^---!                ',
        '                ----------^---!       ',
        '                ----------------^---! ',
      ];
      const expected = ' -----y--------x-----x|';
      const result = e1[throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should interrupt source and duration when result is unsubscribed early', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-x-y-z-xyz-x-y-z----b--x-x-|');
      const unsub = '   --------------!               ';
      const e1subs = '  ^-------------!               ';
      const e2 = cold('  -----x------------|          ');
      const e2subs = [
        '               -^----!                       ',
        '               -------^----!                 ',
        '               -------------^!               ',
      ];
      const expected = '------y-----z--               ';
      const result = e1[throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-x-y-z-xyz-x-y-z----b--x-x-|');
      const e1subs = '  ^-------------!               ';
      const e2 = cold('  -----x------------|          ');
      const e2subs = [
        '               -^----!                       ',
        '               -------^----!                 ',
        '               -------------^!               ',
      ];
      const expected = '------y-----z--               ';
      const unsub = '   --------------!               ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false })
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle a busy producer emitting a regular repeating sequence', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|    ');
      const e1subs = '  ^------------------------!    ';
      const e2 = cold(' -----x                        ');
      const e2subs = [
        '               ^----!                        ',
        '               ------^----!                  ',
        '               ------------^----!            ',
        '               ------------------^----!      ',
        '               ------------------------^----!',
      ];
      const expected = '-----f-----f-----f-----f-----(a|)';
      const result = e1[throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should mirror source if durations are immediate', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^------------------------!';
      const e2 = cold(' x');
      const expected = 'abcdefabcdefabcdefabcdefa|';
      const result = e1[throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit no values if durations are EMPTY', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^------------------------!';
      const e2 = EMPTY;
      const expected = '-------------------------|';
      const result = e1[throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit no values and never complete if duration is a never', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^----------------------------!';
      const e2 = cold(' -');
      const e2subs = '----^--------------------------!';
      const expected = '------------------------------';
      const result = e1[throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result, '^------------------------------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should unsubscribe duration Observable when source raise error', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----abcdefabcdefabcdefabcdefa#');
      const e1subs = '  ^----------------------------!';
      const e2 = cold(' -');
      const e2subs = '  ----^------------------------!';
      const expected = '-----------------------------#';
      const result = e1[throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should mirror source if durations are synchronous observables', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^------------------------!';
      const e2 = ColdObservable.from(['one single value']);
      const expected = 'abcdefabcdefabcdefabcdefa|';
      const result = e1[throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error as soon as just-throw duration is used', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^---!                         ';
      const e2 = cold(' #');
      const e2subs = '  ----(^!)                      ';
      const expected = '----(-#)                      ';
      const result = e1[throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should audit using durations of varying lengths', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdabcdefghabca|     ');
      const e1subs = '  ^---------------------!     ';
      const e2 = [
        cold('          -----x                      '),
        cold('              ---x                    '),
        cold('                  -------x            '),
        cold('                        --x           '),
        cold('                           ----x      '),
      ];
      const e2subs = [
        '               ^----!                      ',
        '               ------^--!                  ',
        '               ----------^------!          ',
        '               ------------------^-!       ',
        '               ---------------------^---!  ',
      ];
      const expected = '-----f---d-------h--c----(a|)';
      let i = 0;
      const result = e1[throttle](() => e2[i++], { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let j = 0; j < e2.length; j++) {
        expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
      }
    });
  });
  it('should propagate error from duration Observable', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdabcdefghabca|');
      const e1subs = '  ^----------------!     ';
      const e2 = [
        cold('          -----x                 '),
        cold('              ---x               '),
        cold('                  -------#       '),
      ];
      const e2subs = [
        '               ^----!                 ',
        '               ------^--!             ',
        '               ----------^------!     ',
      ];
      const expected = '-----f---d-------#     ';
      let i = 0;
      const result = e1[throttle](() => e2[i++], { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let j = 0; j < e2.length; j++) {
        expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
      }
    });
  });
  it('should propagate error thrown from durationSelector function', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdabcdefghabca|   ');
      const e1subs = '  ^---------!               ';
      const e2 = [
        cold('          -----x                    '),
        cold('              ---x                  '),
        cold('                  -------x          '),
      ];
      // prettier-ignore
      const e2subs = [
                '               ^----!                     ',
                '               ------^--!                 ',
            ];
      const expected = '-----f---d#                ';
      let i = 0;
      const result = e1[throttle](
        () => {
          if (i === 2) {
            throw 'error';
          }
          return e2[i++];
        },
        { leading: false, trailing: true, restartOnTrailing: false }
      );
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let j = 0; j < e2subs.length; j++) {
        expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
      }
    });
  });
  it('should complete when source does not emit', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|');
      const subs = '    ^----!';
      const expected = '-----|';
      function durationSelector() {
        return cold('-----|');
      }
      expectObservable(e1[throttle](durationSelector, { leading: false, trailing: true, restartOnTrailing: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should raise error when source does not emit and raises error', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----#');
      const subs = '    ^----!';
      const expected = '-----#';
      function durationSelector() {
        return cold('   -----|');
      }
      expectObservable(e1[throttle](durationSelector, { leading: false, trailing: true, restartOnTrailing: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle an empty source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const subs = '    (^!)';
      const expected = '|';
      function durationSelector() {
        return cold('   -----|');
      }
      expectObservable(e1[throttle](durationSelector, { leading: false, trailing: true, restartOnTrailing: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle a never source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const subs = '^!';
      const expected = '-';
      function durationSelector() {
        return cold('   -----|');
      }
      expectObservable(e1[throttle](durationSelector, { leading: false, trailing: true, restartOnTrailing: false }), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle a throw source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const subs = '    (^!)';
      const expected = '#';
      function durationSelector() {
        return cold('   -----|');
      }
      expectObservable(e1[throttle](durationSelector, { leading: false, trailing: true, restartOnTrailing: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should emit last value after duration completes if source completes first', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--------xy|  ');
      const e1subs = '  ^-----------!  ';
      const e2 = cold('  ----x         ');
      // prettier-ignore
      const e2subs = [
                '               -^---!         ',
                '               ----------^---!',
            ];
      const expected = '-----a--------(y|)';
      const result = e1[throttle](() => e2, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
