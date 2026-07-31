// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/retryWhen-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { EMPTY } from 'rxjs/empty';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { retryWhen } from 'rxjs/retry-when';
import { takeUntil } from 'rxjs/take-until';
describe('retryWhen (cold)', () => {
  it('should handle a source with eventual error using a hot notifier', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold(' -1--2--#                     ');
      //                                 -1--2--#
      //                                              -1--2--#
      const subs = [
        '                   ^------!                     ',
        '                   -------------^------!        ',
        '                   --------------------------^-!',
      ];
      const notifier = hot('-------------r------------r-|');
      const expected = '    -1--2---------1--2---------1|';
      const result = source[retryWhen](() => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle a source with eventual error using a hot notifier that raises error', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold(' -1--2--#                      ');
      //                               -1--2--#
      //                                       -1--2--#
      const subs = [
        '                   ^------!                      ',
        '                   -----------^------!           ',
        '                   -------------------^------!   ',
      ];
      const notifier = hot('-----------r-------r---------#');
      const expected = '    -1--2-------1--2----1--2-----#';
      const result = source[retryWhen](() => notifier);
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
      const result = source[retryWhen](() => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should apply a never notifier on an empty source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  |   ');
      const subs = '         (^!)';
      const notifier = cold('-   ');
      const expected = '     |   ';
      const result = source[retryWhen](() => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should apply an empty notifier on a never source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  ------------------------------------------');
      const unsub = '        -----------------------------------------!';
      const subs = '         ^----------------------------------------!';
      const notifier = cold('|                                         ');
      const expected = '     ------------------------------------------';
      const result = source[retryWhen](() => notifier);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should apply a never notifier on a never source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  -----------------------------------------');
      const unsub = '        -----------------------------------------!';
      const subs = '         ^----------------------------------------!';
      const notifier = cold('------------------------------------------');
      const expected = '     -----------------------------------------';
      const result = source[retryWhen](() => notifier);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should return an empty observable given a just-throw source and empty notifier', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('  #');
      const notifier = cold('|');
      const expected = '     |';
      const result = source[retryWhen](() => notifier);
      expectObservable(result).toBe(expected);
    });
  });
  it('should return a never observable given a just-throw source and never notifier', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('  #');
      const notifier = cold('-');
      const expected = '     -';
      const result = source[retryWhen](() => notifier);
      expectObservable(result, '^!').toBe(expected);
    });
  });
  it('should hide errors using a never notifier on a source with eventual error', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  --a--b--c--#                              ');
      const subs = '         ^----------!                              ';
      const notifier = cold('           -------------------------------');
      const expected = '     --a--b--c---------------------------------';
      const result = source[retryWhen](() => notifier);
      expectObservable(result, '^-----------------------------------------!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should propagate error thrown from notifierSelector function', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--a--b--c--#');
      const subs = '       ^----------!';
      const expected = '   --a--b--c--#';
      const result = source[retryWhen](() => {
        throw 'bad!';
      });
      expectObservable(result).toBe(expected, undefined, 'bad!');
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should replace error with complete using an empty notifier on a source with eventual error', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  --a--b--c--#');
      const subs = '         ^----------!';
      const notifier = cold('           |');
      const expected = '     --a--b--c--|';
      const result = source[retryWhen](() => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should mirror a basic cold source with complete, given an empty notifier', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  --a--b--c--|');
      const subs = '         ^----------!';
      const notifier = cold('           |');
      const expected = '     --a--b--c--|';
      const result = source[retryWhen](() => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should mirror a basic cold source with no termination, given an empty notifier', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  --a--b--c---');
      const subs = '^-----------!';
      const notifier = cold('           |');
      const expected = '     --a--b--c---';
      const result = source[retryWhen](() => notifier);
      expectObservable(result, '^-----------!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should mirror a basic hot source with complete, given an empty notifier', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-a-^--b--c--|');
      const subs = '         ^--------!';
      const notifier = cold('         |');
      const expected = '     ---b--c--|';
      const result = source[retryWhen](() => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle a hot source that raises error but eventually completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('  -1--2--3----4--5---|                  ');
      const ssubs = [
        '                   ^------!                              ',
        '                   --------------^----!                  ',
      ];
      const notifier = hot('--------------r--------r---r--r--r---|');
      const nsubs = '       -------^-----------!                  ';
      const expected = '    -1--2----------5---|                  ';
      const result = source[map]((x) => {
        if (x === '3') {
          throw 'error';
        }
        return x;
      })[retryWhen](() => notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(ssubs);
      expectSubscriptions(notifier.subscriptions).toBe(nsubs);
    });
  });
  it('should tear down resources when result is unsubscribed early', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = cold(' -1--2--#                    ');
      //                             -1--2--#
      //                                     -1--2--#
      const unsub = '       --------------------!       ';
      const subs = [
        '                   ^------!                    ',
        '                   ---------^------!           ',
        '                   -----------------^--!       ',
      ];
      const notifier = hot('---------r-------r---------#');
      const nsubs = '       -------^------------!       ';
      const expected = '    -1--2-----1--2----1--       ';
      const result = source[retryWhen](() => notifier);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(notifier.subscriptions).toBe(nsubs);
    });
  });
  it('should not break unsubscription chains when unsubscribed explicitly', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = cold(' -1--2--#                    ');
      //                             -1--2--#
      //                                     -1--2--#
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
        [retryWhen](() => notifier)
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(notifier.subscriptions).toBe(nsubs);
    });
  });
  it('should handle a source with eventual error using a dynamic notifier selector which eventually throws', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-1--2--#              ');
      //                          -1--2--#
      //                                 -1--2--#
      const subs = [
        '                  ^------!              ',
        '                  -------^------!       ',
        '                  --------------^------!',
      ];
      const expected = '   -1--2---1--2---1--2--#';
      let invoked = 0;
      const result = source[retryWhen]((errors) =>
        errors[map](() => {
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
      const source = cold('-1--2--#              ');
      //                          -1--2--#
      //                                 -1--2--#
      const subs = [
        '                  ^------!              ',
        '                  -------^------!       ',
        '                  --------------^------!',
      ];
      const expected = '   -1--2---1--2---1--2--|';
      let invoked = 0;
      const result = source[retryWhen]((errors) =>
        errors[map](() => 'x')[takeUntil](
          errors[mergeMap](() => {
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
