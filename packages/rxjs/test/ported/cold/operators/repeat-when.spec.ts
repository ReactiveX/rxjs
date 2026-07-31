// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/repeatWhen-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { EMPTY } from 'rxjs/empty';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { repeatWhen } from 'rxjs/repeat-when';
import { takeUntil } from 'rxjs/take-until';
import { takeWhile } from 'rxjs/take-while';
describe('repeatWhen (cold)', () => {
  it('should handle a source with eventual complete using a hot notifier', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('-1--2--|');
      //                                 -1--2--|
      //                                              -1--2--|
      const subs = [
        '                  ^------!                          ',
        '                  -------------^------!             ',
        '                  --------------------------^------!',
      ];
      const notifier = hot('-------------r------------r-|    ');
      const expected = '    -1--2---------1--2---------1--2--|';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle a source with eventual complete using a hot notifier that raises error', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold(' -1--2--|');
      const subs = [
        '                   ^------!                      ',
        '                   -----------^------!           ',
        '                   -------------------^------!   ',
      ];
      const notifier = hot('-----------r-------r---------#');
      const expected = '    -1--2-------1--2----1--2-----#';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should apply an empty notifier on an empty source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  |   ');
      const subs = '         (^!)';
      const notifier = cold('|   ');
      const expected = '     |   ';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should apply a never notifier on an empty source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  |   ');
      const subs = '         (^!)';
      const notifier = cold('-   ');
      const expected = '     -   ';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should apply an empty notifier on a never source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  -                                         ');
      const unsub = '        -----------------------------------------!';
      const subs = '         ^----------------------------------------!';
      const notifier = cold('|                                         ');
      const expected = '     -                                         ';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should apply a never notifier on a never source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  -                                         ');
      const unsub = '        -----------------------------------------!';
      const subs = '         ^----------------------------------------!';
      const notifier = cold('-                                        ');
      const expected = '     -                                        ';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should return an empty observable given a just-throw source and empty notifier', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('  #');
      const notifier = cold('|');
      const expected = '     #';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result).toBe(expected);
    });
  });
  it('should return a error observable given a just-throw source and never notifier', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('  #');
      const notifier = cold('-');
      const expected = '     #';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result).toBe(expected);
    });
  });
  it('should return a never-ending result if the notifier is never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  --a--b--c--|                              ');
      const subs = '         ^----------!                              ';
      const notifier = cold('           -                              ');
      const expected = '     --a--b--c---------------------------------';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result, '^-----------------------------------------!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should propagate error thrown from notifierSelector function', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--a--b--c--|');
      const subs = '       ^----------!';
      const expected = '   --a--b--c--#';
      const result = source[repeatWhen](() => {
        throw 'bad!';
      });
      expectObservable(result).toBe(expected, undefined, 'bad!');
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should complete if the notifier only completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  --a--b--c--|');
      const subs = '         ^----------!';
      const notifier = cold('           |');
      const expected = '     --a--b--c--|';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should mirror a basic cold source with complete, given a never notifier', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  --a--b--c--|');
      const subs = '         ^----------!';
      const notifier = cold('           |');
      const expected = '     --a--b--c--|';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should mirror a basic cold source with no termination, given a never notifier', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  --a--b--c---');
      const subs = '^-----------!';
      const notifier = cold('           |');
      const expected = '     --a--b--c---';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result, '^-----------!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should mirror a basic hot source with complete, given a never notifier', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-a-^--b--c--|');
      const subs = '         ^--------!';
      const notifier = cold('         |');
      const expected = '     ---b--c--|';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle a host source that completes via operator like take, and a hot notifier', async () => {
    await rxTest(({ expectObservable, expectSubscriptions, hot }) => {
      const source = hot('-1--2--3----4--5---|');
      const notifier = hot('--------------r--------r---r--r--r---|');
      const result = source[takeWhile]((value) => value !== '3')[repeatWhen](() => notifier);
      // The skipped RxJS 7 expectation completed at frame 19 even though the
      // notifier remained active. Preserve the host-source behavior while
      // asserting the notifier contract: later notifications attempt immediate
      // resubscriptions to the already-completed hot source, and the result
      // completes when the notifier completes at frame 37.
      expectObservable(result).toBe('-1--2----------5---------------------|');
      expectSubscriptions(source.subscriptions).toBe([
        '^------!',
        '--------------^----!',
        '-----------------------(^!)',
        '---------------------------(^!)',
        '------------------------------(^!)',
        '---------------------------------(^!)',
      ]);
      expectSubscriptions(notifier.subscriptions).toBe('-------^-----------------------------!');
    });
  });
  it('should tear down resources when result is unsubscribed early', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold(' -1--2--|');
      const unsub = '       --------------------!       ';
      const subs = [
        '                   ^------!                    ',
        '                   ---------^------!           ',
        '                   -----------------^--!       ',
      ];
      const notifier = hot('---------r-------r---------#');
      const nsubs = '       -------^------------!       ';
      const expected = '    -1--2-----1--2----1--       ';
      const result = source[repeatWhen]((notifications) => notifier);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(notifier.subscriptions).toBe(nsubs);
    });
  });
  it('should not break unsubscription chains when unsubscribed explicitly', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold(' -1--2--|');
      const subs = [
        '                   ^------!                    ',
        '                   ---------^------!           ',
        '                   -----------------^--!       ',
      ];
      const notifier = hot('---------r-------r-------r-#');
      const nsubs = '       -------^------------!       ';
      const expected = '    -1--2-----1--2----1--       ';
      const unsub = '       --------------------!       ';
      const result = source[mergeMap]((x) => ColdObservable.from([x]))
        [repeatWhen]((notifications) => notifier)
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(notifier.subscriptions).toBe(nsubs);
    });
  });
  it('should handle a source with eventual error using a dynamic notifier selector which eventually throws', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-1--2--|');
      const subs = [
        '                  ^------!              ',
        '                  -------^------!       ',
        '                  --------------^------!',
      ];
      const expected = '   -1--2---1--2---1--2--#';
      let invoked = 0;
      const result = source[repeatWhen]((notifications) =>
        notifications[map]((err) => {
          if (++invoked === 3) {
            throw 'error';
          } else {
            return 'x';
          }
        })
      );
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle a source with eventual error using a dynamic notifier selector which eventually completes', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-1--2--|');
      const subs = [
        '                  ^------!              ',
        '                  -------^------!       ',
        '                  --------------^------!',
      ];
      const expected = '   -1--2---1--2---1--2--|';
      let invoked = 0;
      const result = source[repeatWhen]((notifications) =>
        notifications[map](() => 'x')[takeUntil](
          notifications[mergeMap](() => {
            if (++invoked < 3) {
              return EMPTY;
            } else {
              return ColdObservable.from(['stop!']);
            }
          })
        )
      );
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
});
