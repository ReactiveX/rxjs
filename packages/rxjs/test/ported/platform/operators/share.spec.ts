// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/share-spec.ts
import { describe, expect, it, vi } from 'vitest';
import { rxTest } from '@rxjs/test';
import { concat } from 'rxjs/concat';
import { EMPTY } from 'rxjs/empty';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { NEVER } from 'rxjs/never';
import { onErrorResumeNext } from 'rxjs/on-error-resume-next';
import { repeat } from 'rxjs/repeat';
import { retry } from 'rxjs/retry';
import { share } from 'rxjs/share';
import { startWith } from 'rxjs/start-with';
import { Subject } from 'rxjs/subject';
import { take } from 'rxjs/take';
import { takeUntil } from 'rxjs/take-until';
import { takeWhile } from 'rxjs/take-while';
import { tap } from 'rxjs/tap';
import { withLatestFrom } from 'rxjs/with-latest-from';
describe('share (platform)', () => {
  it('should use the connector function provided', async () => {
    const connector = vi.fn(() => new Subject());
    await rxTest(({ hot, expectObservable }) => {
      const source = hot('  ---v---v---v---E--v---v---v---C---v----v--------v----v---');
      const subs1 = '       ^-------------------------------------------!            ';
      const expResult1 = '  ---v---v---v------v---v---v-------v----v-----            ';
      const subs2 = '       ----------------------------------------------^---------!';
      const expResult2 = '  ------------------------------------------------v----v---';
      const result = source[tap]((value) => {
        if (value === 'E') {
          throw new Error('E');
        }
      })
        [takeWhile]((value) => value !== 'C')
        [share]({
          connector,
        })
        [retry]({ resetOnSuccess: false })
        [repeat]();
      expectObservable(result, subs1).toBe(expResult1);
      expectObservable(result, subs2).toBe(expResult2);
    });
    expect(connector).toHaveBeenCalledTimes(4);
  });
  it('should reset on refCount 0 when synchronously resubscribing and using a sync reset notifier', async () => {
    const syncNotify = Observable.from([1]);
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---1---2---3---(4 )---5---|');
      const sourceSubs = [
        '                   ^------!                   ',
        // break the line, please
        '                   -------^-------(! )        ',
      ];
      const expected = '    ---1---2---3---(4|)        ';
      const subscription = '^--------------(- )        ';
      const sharedSource = source[share]({ resetOnRefCountZero: () => syncNotify })[take](2);
      const result = Observable[concat]([sharedSource, sharedSource]);
      expectObservable(result, subscription).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not reset on refCount 0 when synchronously resubscribing and using a deferred reset notifier', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions, schedule }) => {
      const deferredNotify = new Observable((subscriber) => {
        schedule(
          () => {
            subscriber.next(1);
            subscriber.complete();
          },
          0,
          { signal: subscriber.signal }
        );
      });
      const source = observable('---1---2---3---4---5---|');
      const sharedSource = source[share]({ resetOnRefCountZero: () => deferredNotify })[take](3);
      const result = Observable[concat]([sharedSource, sharedSource]);
      // A zero-delay rxTest task represents the original asap reset. concat
      // resubscribes synchronously first, cancelling that pending reset without
      // exposing scheduled/asapScheduler as compatibility capabilities.
      expectObservable(result, '^-----------------------').toBe('---1---2---3---4---5---|');
      expectSubscriptions(source.subscriptions).toBe('^----------------------!');
    });
  });
  it('should reset on refCount 0 only after reset notifier emitted', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const source = hot('      ---1---2---3---4---5---|');
      const sourceSubs = [
        '                       ^----------------!      ',
        // break the line, please
        '                       ------------------^----!',
      ];
      const expected = '        ---1---2---3---4---5---|';
      const subscription = '    ^-----------------------';
      const firstPause = observable('        -|               ');
      const reset = observable('             --r              ');
      const secondPause = observable('               ---|     ');
      // reset: '                              --r      '
      const sharedSource = source[share]({ resetOnRefCountZero: () => reset })[take](2);
      const result = Observable[concat]([sharedSource, firstPause, sharedSource, secondPause, sharedSource]);
      expectObservable(result, subscription).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should reset on error only after reset notifier emitted', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('     ---1---2---#                ');
      // source: '                            ---1---2---#  '
      const sourceSubs = [
        '                       ^----------!                ',
        // break the line, please
        '                       --------------^----------!  ',
      ];
      const expected = '        ---1---2---------1---2----# ';
      const subscription = '    ^-------------------------- ';
      const firstPause = observable('        -------|             ');
      const reset = observable('                 --r              ');
      const secondPause = observable('                     -----| ');
      // reset: '                                        --r'
      const sharedSource = source[share]({ resetOnError: () => reset, resetOnRefCountZero: false })[take](2);
      const result = Observable[concat]([sharedSource, firstPause, sharedSource, secondPause, sharedSource]);
      expectObservable(result, subscription).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should reset on complete only after reset notifier emitted', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('     ---1---2---|                ');
      // source: '                            ---1---2---|  '
      const sourceSubs = [
        '                       ^----------!                ',
        // break the line, please
        '                       --------------^----------!  ',
      ];
      const expected = '        ---1---2---------1---2----| ';
      const subscription = '    ^-------------------------- ';
      const firstPause = observable('        -------|             ');
      const reset = observable('                 --r              ');
      const secondPause = observable('                     -----| ');
      // reset: '                                        --r'
      const sharedSource = source[share]({ resetOnComplete: () => reset, resetOnRefCountZero: false })[take](2);
      const result = Observable[concat]([sharedSource, firstPause, sharedSource, secondPause, sharedSource]);
      expectObservable(result, subscription).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not reset on refCount 0 if reset notifier errors before emitting any value', async () => {
    const onUnhandledError = vi.fn();
    {
      const error = new Error();
      await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
        globalThis.reportError = onUnhandledError;
        const source = hot('---1---2---3---4---(5 )---|');
        const firstPause = observable('------|');
        const reset = observable('--#', undefined, error);
        const sharedSource = source[share]({ resetOnRefCountZero: () => reset })[take](2);
        const result = Observable[concat]([sharedSource, firstPause, sharedSource]);
        expectObservable(result, '^------------------(- )').toBe('---1---2-------4---(5|)');
        expectSubscriptions(source.subscriptions).toBe('^------------------(- )---!');
      });
      expect(onUnhandledError).toHaveBeenCalledTimes(2);
      for (let index = 0; index < 2; index++) {
        expect(onUnhandledError).toHaveBeenNthCalledWith(index + 1, error);
      }
    }
  });
  it('should not reset on error if reset notifier errors before emitting any value', async () => {
    const onUnhandledError = vi.fn();
    {
      const error = new Error();
      await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
        globalThis.reportError = onUnhandledError;
        const source = observable('---1---2---#');
        const firstPause = observable('-------|');
        const reset = observable('--#', undefined, error);
        const sharedSource = source[share]({ resetOnError: () => reset, resetOnRefCountZero: false })[take](2);
        const result = Observable[concat]([sharedSource, firstPause, sharedSource]);
        expectObservable(result, '^--------------').toBe('---1---2------#');
        expectSubscriptions(source.subscriptions).toBe('^----------!');
      });
      expect(onUnhandledError).toHaveBeenCalledTimes(1);
      for (let index = 0; index < 1; index++) {
        expect(onUnhandledError).toHaveBeenNthCalledWith(index + 1, error);
      }
    }
  });
  it('should not reset on complete if reset notifier errors before emitting any value', async () => {
    const onUnhandledError = vi.fn();
    {
      const error = new Error();
      await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
        globalThis.reportError = onUnhandledError;
        const source = observable('---1---2---|');
        const firstPause = observable('-------|');
        const reset = observable('--#', undefined, error);
        const sharedSource = source[share]({ resetOnComplete: () => reset, resetOnRefCountZero: false })[take](2);
        const result = Observable[concat]([sharedSource, firstPause, sharedSource]);
        expectObservable(result, '^--------------').toBe('---1---2------|');
        expectSubscriptions(source.subscriptions).toBe('^----------!');
      });
      expect(onUnhandledError).toHaveBeenCalledTimes(1);
      for (let index = 0; index < 1; index++) {
        expect(onUnhandledError).toHaveBeenNthCalledWith(index + 1, error);
      }
    }
  });
  it('should not call "resetOnRefCountZero" on error', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const resetOnRefCountZero = vi.fn(() => EMPTY);
      const source = observable('    ---1---(2#)                ');
      // source: '                           ---1---(2#)  '
      const sourceSubs = [
        '                      ^------(! )                ',
        // break the line, please
        '                      -------(- )---^------(! )  ',
      ];
      const expected = '       ---1---(2 )------1---(2#)  ';
      const subscription = '   ^------(- )----------(- )  ';
      const firstPause = observable('       (- )---|            ');
      const reset = observable('            (- )-r              ');
      // reset: '                                   (- )-r'
      const sharedSource = source[share]({ resetOnError: () => reset, resetOnRefCountZero });
      const result = Observable[concat]([sharedSource[onErrorResumeNext]([firstPause]), sharedSource]);
      expectObservable(result, subscription).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expect(resetOnRefCountZero).not.toHaveBeenCalled();
    });
  });
  it('should not call "resetOnRefCountZero" on complete', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const resetOnRefCountZero = vi.fn(() => EMPTY);
      const source = observable('    ---1---(2|)                ');
      // source: '                           ---1---(2|)  '
      const sourceSubs = [
        '                      ^------(! )                ',
        // break the line, please
        '                      -------(- )---^------(! )  ',
      ];
      const expected = '       ---1---(2 )------1---(2|)  ';
      const subscription = '   ^------(- )----------(- )  ';
      const firstPause = observable('       (- )---|            ');
      const reset = observable('            (- )-r              ');
      // reset: '                                   (- )-r'
      const sharedSource = source[share]({ resetOnComplete: () => reset, resetOnRefCountZero });
      const result = Observable[concat]([sharedSource, firstPause, sharedSource]);
      expectObservable(result, subscription).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expect(resetOnRefCountZero).not.toHaveBeenCalled();
    });
  });
  it('should mirror a simple source Observable [share()]', async () => {
    const options = {};
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const expected = '   --1-2---3-4--5-|';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should mirror a simple source Observable [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const expected = '   --1-2---3-4--5-|';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should mirror a simple source Observable [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const expected = '   --1-2---3-4--5-|';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should mirror a simple source Observable [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const expected = '   --1-2---3-4--5-|';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should mirror a simple source Observable [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const expected = '   --1-2---3-4--5-|';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not change the output of the observable when error [share()]', async () => {
    const options = {};
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---a--^--b--c--d--e--#');
      const e1subs = '      ^--------------!';
      const expected = '    ---b--c--d--e--#';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when error [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---a--^--b--c--d--e--#');
      const e1subs = '      ^--------------!';
      const expected = '    ---b--c--d--e--#';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when error [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---a--^--b--c--d--e--#');
      const e1subs = '      ^--------------!';
      const expected = '    ---b--c--d--e--#';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when error [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---a--^--b--c--d--e--#');
      const e1subs = '      ^--------------!';
      const expected = '    ---b--c--d--e--#';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when error [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---a--^--b--c--d--e--#');
      const e1subs = '      ^--------------!';
      const expected = '    ---b--c--d--e--#';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when successful with cold observable [share()]', async () => {
    const options = {};
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--|');
      const e1subs = '  ^-----------------!';
      const expected = '---a--b--c--d--e--|';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when successful with cold observable [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--|');
      const e1subs = '  ^-----------------!';
      const expected = '---a--b--c--d--e--|';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when successful with cold observable [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--|');
      const e1subs = '  ^-----------------!';
      const expected = '---a--b--c--d--e--|';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when successful with cold observable [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--|');
      const e1subs = '  ^-----------------!';
      const expected = '---a--b--c--d--e--|';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when successful with cold observable [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--|');
      const e1subs = '  ^-----------------!';
      const expected = '---a--b--c--d--e--|';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when error with cold observable [share()]', async () => {
    const options = {};
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--#');
      const e1subs = '  ^-----------------!';
      const expected = '---a--b--c--d--e--#';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when error with cold observable [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--#');
      const e1subs = '  ^-----------------!';
      const expected = '---a--b--c--d--e--#';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when error with cold observable [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--#');
      const e1subs = '  ^-----------------!';
      const expected = '---a--b--c--d--e--#';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when error with cold observable [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--#');
      const e1subs = '  ^-----------------!';
      const expected = '---a--b--c--d--e--#';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not change the output of the observable when error with cold observable [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--#');
      const e1subs = '  ^-----------------!';
      const expected = '---a--b--c--d--e--#';
      expectObservable(e1[share](options)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should retry just fine [share()]', async () => {
    const options = {};
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--#                  ');
      // prettier-ignore
      const e1subs = [
                '               ^-----------------!                  ',
                '               ------------------^-----------------!'
            ];
      const expected = '---a--b--c--d--e-----a--b--c--d--e--#';
      expectObservable(e1[share](options)[retry]({ count: 1, resetOnSuccess: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should retry just fine [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--#                  ');
      // prettier-ignore
      const e1subs = [
                '               ^-----------------!                  ',
                '               ------------------^-----------------!'
            ];
      const expected = '---a--b--c--d--e-----a--b--c--d--e--#';
      expectObservable(e1[share](options)[retry]({ count: 1, resetOnSuccess: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should retry just fine [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--#                  ');
      // prettier-ignore
      const e1subs = [
                '               ^-----------------!                  ',
                '               ------------------^-----------------!'
            ];
      const expected = '---a--b--c--d--e-----a--b--c--d--e--#';
      expectObservable(e1[share](options)[retry]({ count: 1, resetOnSuccess: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should retry just fine [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--#                  ');
      // prettier-ignore
      const e1subs = [
                '               ^-----------------!                  ',
                '               ------------------^-----------------!'
            ];
      const expected = '---a--b--c--d--e-----a--b--c--d--e--#';
      expectObservable(e1[share](options)[retry]({ count: 1, resetOnSuccess: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should retry just fine [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--d--e--#                  ');
      // prettier-ignore
      const e1subs = [
                '               ^-----------------!                  ',
                '               ------------------^-----------------!'
            ];
      const expected = '---a--b--c--d--e-----a--b--c--d--e--#';
      expectObservable(e1[share](options)[retry]({ count: 1, resetOnSuccess: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should share the same values to multiple observers [share()]', async () => {
    const options = {};
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-|');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-|';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----4-|';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------4-|';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share the same values to multiple observers [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-|');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-|';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----4-|';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------4-|';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share the same values to multiple observers [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-|');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-|';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----4-|';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------4-|';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share the same values to multiple observers [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-|');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-|';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----4-|';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------4-|';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share the same values to multiple observers [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-|');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-|';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----4-|';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------4-|';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share an error from the source to multiple observers [share()]', async () => {
    const options = {};
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-#');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-#';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----4-#';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------4-#';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share an error from the source to multiple observers [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-#');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-#';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----4-#';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------4-#';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share an error from the source to multiple observers [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-#');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-#';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----4-#';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------4-#';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share an error from the source to multiple observers [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-#');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-#';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----4-#';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------4-#';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share an error from the source to multiple observers [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-#');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-#';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----4-#';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------4-#';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share the same values to multiple observers, but is unsubscribed explicitly and early [share()]', async () => {
    const options = {};
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-|');
      const sourceSubs = '     ^--------!   ';
      const unsub = '          ---------!   ';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----   ';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----   ';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------   ';
      const shared = source[share](options);
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub
      ).toBe(expected2);
      expectObservable(
        subscriber3[mergeMap](() => shared),
        unsub
      ).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share the same values to multiple observers, but is unsubscribed explicitly and early [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-|');
      const sourceSubs = '     ^--------!   ';
      const unsub = '          ---------!   ';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----   ';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----   ';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------   ';
      const shared = source[share](options);
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub
      ).toBe(expected2);
      expectObservable(
        subscriber3[mergeMap](() => shared),
        unsub
      ).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share the same values to multiple observers, but is unsubscribed explicitly and early [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-|');
      const sourceSubs = '     ^--------!   ';
      const unsub = '          ---------!   ';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----   ';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----   ';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------   ';
      const shared = source[share](options);
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub
      ).toBe(expected2);
      expectObservable(
        subscriber3[mergeMap](() => shared),
        unsub
      ).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share the same values to multiple observers, but is unsubscribed explicitly and early [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-|');
      const sourceSubs = '     ^--------!   ';
      const unsub = '          ---------!   ';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----   ';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----   ';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------   ';
      const shared = source[share](options);
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub
      ).toBe(expected2);
      expectObservable(
        subscriber3[mergeMap](() => shared),
        unsub
      ).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share the same values to multiple observers, but is unsubscribed explicitly and early [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('    -1-2-3----4-|');
      const sourceSubs = '     ^--------!   ';
      const unsub = '          ---------!   ';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----   ';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      -----3----   ';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      ----------   ';
      const shared = source[share](options);
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub
      ).toBe(expected2);
      expectObservable(
        subscriber3[mergeMap](() => shared),
        unsub
      ).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share an empty source [share()]', async () => {
    const options = {};
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('|   ');
      const sourceSubs = ' (^!)';
      const expected = '   |   ';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share an empty source [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('|   ');
      const sourceSubs = ' (^!)';
      const expected = '   |   ';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share an empty source [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('|   ');
      const sourceSubs = ' (^!)';
      const expected = '   |   ';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share an empty source [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('|   ');
      const sourceSubs = ' (^!)';
      const expected = '   |   ';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share an empty source [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('|   ');
      const sourceSubs = ' (^!)';
      const expected = '   |   ';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share a never source [share()]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const options = {};
      const source = observable('-');
      const shared = source[share](options);
      // The original one-frame diagram asserts silence from a live source.
      // Bound both observations at that evidence horizon.
      expectObservable(shared, '^!').toBe('-');
      expectSubscriptions(source.subscriptions).toBe('^!');
    });
  });
  it('should share a never source [share() using sync reset notifiers equivalent to default config]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => syncNotify,
        resetOnComplete: () => syncNotify,
        resetOnRefCountZero: () => syncNotify,
      };
      const source = observable('-');
      const shared = source[share](options);
      // The original one-frame diagram asserts silence from a live source.
      // Bound both observations at that evidence horizon.
      expectObservable(shared, '^!').toBe('-');
      expectSubscriptions(source.subscriptions).toBe('^!');
    });
  });
  it('should share a never source [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
        resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
      };
      const source = observable('-');
      const shared = source[share](options);
      // The original one-frame diagram asserts silence from a live source.
      // Bound both observations at that evidence horizon.
      expectObservable(shared, '^!').toBe('-');
      expectSubscriptions(source.subscriptions).toBe('^!');
    });
  });
  it('should share a never source [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, NEVER]),
        resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
      };
      const source = observable('-');
      const shared = source[share](options);
      // The original one-frame diagram asserts silence from a live source.
      // Bound both observations at that evidence horizon.
      expectObservable(shared, '^!').toBe('-');
      expectSubscriptions(source.subscriptions).toBe('^!');
    });
  });
  it('should share a never source [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const syncError = new Observable((subscriber) => {
        subscriber.error(new Error());
      });
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, syncError]),
        resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
      };
      const source = observable('-');
      const shared = source[share](options);
      // The original one-frame diagram asserts silence from a live source.
      // Bound both observations at that evidence horizon.
      expectObservable(shared, '^!').toBe('-');
      expectSubscriptions(source.subscriptions).toBe('^!');
    });
  });
  it('should share a throw source [share()]', async () => {
    const options = {};
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('#   ');
      const sourceSubs = ' (^!)';
      const expected = '   #   ';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share a throw source [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('#   ');
      const sourceSubs = ' (^!)';
      const expected = '   #   ';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share a throw source [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('#   ');
      const sourceSubs = ' (^!)';
      const expected = '   #   ';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share a throw source [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('#   ');
      const sourceSubs = ' (^!)';
      const expected = '   #   ';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should share a throw source [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('#   ');
      const sourceSubs = ' (^!)';
      const expected = '   #   ';
      const shared = source[share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should connect when first subscriber subscribes [share()]', async () => {
    const options = {};
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^-----------!';
      const subscriber1 = hot('---a|           ');
      const expected1 = '      ----1-2-3----4-|';
      const subscriber2 = hot('-------b|       ');
      const expected2 = '      --------3----4-|';
      const subscriber3 = hot('-----------c|   ');
      const expected3 = '      -------------4-|';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should connect when first subscriber subscribes [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^-----------!';
      const subscriber1 = hot('---a|           ');
      const expected1 = '      ----1-2-3----4-|';
      const subscriber2 = hot('-------b|       ');
      const expected2 = '      --------3----4-|';
      const subscriber3 = hot('-----------c|   ');
      const expected3 = '      -------------4-|';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should connect when first subscriber subscribes [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^-----------!';
      const subscriber1 = hot('---a|           ');
      const expected1 = '      ----1-2-3----4-|';
      const subscriber2 = hot('-------b|       ');
      const expected2 = '      --------3----4-|';
      const subscriber3 = hot('-----------c|   ');
      const expected3 = '      -------------4-|';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should connect when first subscriber subscribes [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^-----------!';
      const subscriber1 = hot('---a|           ');
      const expected1 = '      ----1-2-3----4-|';
      const subscriber2 = hot('-------b|       ');
      const expected2 = '      --------3----4-|';
      const subscriber3 = hot('-----------c|   ');
      const expected3 = '      -------------4-|';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should connect when first subscriber subscribes [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^-----------!';
      const subscriber1 = hot('---a|           ');
      const expected1 = '      ----1-2-3----4-|';
      const subscriber2 = hot('-------b|       ');
      const expected2 = '      --------3----4-|';
      const subscriber3 = hot('-----------c|   ');
      const expected3 = '      -------------4-|';
      const shared = source[share](options);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should disconnect when last subscriber unsubscribes [share()]', async () => {
    const options = {};
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^--------!   ';
      const subscriber1 = hot('---a|           ');
      const unsub1 = '         ----------!     ';
      const expected1 = '      ----1-2-3--     ';
      const subscriber2 = hot('-------b|       ');
      const unsub2 = '         ------------!   ';
      const expected2 = '      --------3----   ';
      const shared = source[share](options);
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub1
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub2
      ).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should disconnect when last subscriber unsubscribes [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^--------!   ';
      const subscriber1 = hot('---a|           ');
      const unsub1 = '         ----------!     ';
      const expected1 = '      ----1-2-3--     ';
      const subscriber2 = hot('-------b|       ');
      const unsub2 = '         ------------!   ';
      const expected2 = '      --------3----   ';
      const shared = source[share](options);
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub1
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub2
      ).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should disconnect when last subscriber unsubscribes [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^--------!   ';
      const subscriber1 = hot('---a|           ');
      const unsub1 = '         ----------!     ';
      const expected1 = '      ----1-2-3--     ';
      const subscriber2 = hot('-------b|       ');
      const unsub2 = '         ------------!   ';
      const expected2 = '      --------3----   ';
      const shared = source[share](options);
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub1
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub2
      ).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should disconnect when last subscriber unsubscribes [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^--------!   ';
      const subscriber1 = hot('---a|           ');
      const unsub1 = '         ----------!     ';
      const expected1 = '      ----1-2-3--     ';
      const subscriber2 = hot('-------b|       ');
      const unsub2 = '         ------------!   ';
      const expected2 = '      --------3----   ';
      const shared = source[share](options);
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub1
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub2
      ).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should disconnect when last subscriber unsubscribes [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^--------!   ';
      const subscriber1 = hot('---a|           ');
      const unsub1 = '         ----------!     ';
      const expected1 = '      ----1-2-3--     ';
      const subscriber2 = hot('-------b|       ');
      const unsub2 = '         ------------!   ';
      const expected2 = '      --------3----   ';
      const shared = source[share](options);
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub1
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub2
      ).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not break unsubscription chain when last subscriber unsubscribes [share()]', async () => {
    const options = {};
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^--------!   ';
      const subscriber1 = hot('---a|           ');
      const unsub1 = '         ----------!     ';
      const expected1 = '      ----1-2-3--     ';
      const subscriber2 = hot('-------b|       ');
      const unsub2 = '         ------------!   ';
      const expected2 = '      --------3----   ';
      const shared = source[mergeMap]((x) => Observable.from([x]))
        [share](options)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub1
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub2
      ).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not break unsubscription chain when last subscriber unsubscribes [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^--------!   ';
      const subscriber1 = hot('---a|           ');
      const unsub1 = '         ----------!     ';
      const expected1 = '      ----1-2-3--     ';
      const subscriber2 = hot('-------b|       ');
      const unsub2 = '         ------------!   ';
      const expected2 = '      --------3----   ';
      const shared = source[mergeMap]((x) => Observable.from([x]))
        [share](options)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub1
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub2
      ).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not break unsubscription chain when last subscriber unsubscribes [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^--------!   ';
      const subscriber1 = hot('---a|           ');
      const unsub1 = '         ----------!     ';
      const expected1 = '      ----1-2-3--     ';
      const subscriber2 = hot('-------b|       ');
      const unsub2 = '         ------------!   ';
      const expected2 = '      --------3----   ';
      const shared = source[mergeMap]((x) => Observable.from([x]))
        [share](options)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub1
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub2
      ).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not break unsubscription chain when last subscriber unsubscribes [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^--------!   ';
      const subscriber1 = hot('---a|           ');
      const unsub1 = '         ----------!     ';
      const expected1 = '      ----1-2-3--     ';
      const subscriber2 = hot('-------b|       ');
      const unsub2 = '         ------------!   ';
      const expected2 = '      --------3----   ';
      const shared = source[mergeMap]((x) => Observable.from([x]))
        [share](options)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub1
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub2
      ).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not break unsubscription chain when last subscriber unsubscribes [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const source = observable('       -1-2-3----4-|');
      const sourceSubs = '     ---^--------!   ';
      const subscriber1 = hot('---a|           ');
      const unsub1 = '         ----------!     ';
      const expected1 = '      ----1-2-3--     ';
      const subscriber2 = hot('-------b|       ');
      const unsub2 = '         ------------!   ';
      const expected2 = '      --------3----   ';
      const shared = source[mergeMap]((x) => Observable.from([x]))
        [share](options)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(
        subscriber1[mergeMap](() => shared),
        unsub1
      ).toBe(expected1);
      expectObservable(
        subscriber2[mergeMap](() => shared),
        unsub2
      ).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should be retryable when cold source is synchronous [share()]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const options = {};
      const source = observable('(123#)');
      const shared = source[share](options);
      // Preserve the original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(shared[retry]({ count: 1, resetOnSuccess: false })).toBe('(123123#)');
      expectObservable(shared[retry]({ count: 1, resetOnSuccess: false }), '-^').toBe('-(123123#)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be retryable when cold source is synchronous [share() using sync reset notifiers equivalent to default config]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => syncNotify,
        resetOnComplete: () => syncNotify,
        resetOnRefCountZero: () => syncNotify,
      };
      const source = observable('(123#)');
      const shared = source[share](options);
      // Preserve the original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(shared[retry]({ count: 1, resetOnSuccess: false })).toBe('(123123#)');
      expectObservable(shared[retry]({ count: 1, resetOnSuccess: false }), '-^').toBe('-(123123#)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be retryable when cold source is synchronous [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
        resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
      };
      const source = observable('(123#)');
      const shared = source[share](options);
      // Preserve the original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(shared[retry]({ count: 1, resetOnSuccess: false })).toBe('(123123#)');
      expectObservable(shared[retry]({ count: 1, resetOnSuccess: false }), '-^').toBe('-(123123#)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be retryable when cold source is synchronous [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, NEVER]),
        resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
      };
      const source = observable('(123#)');
      const shared = source[share](options);
      // Preserve the original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(shared[retry]({ count: 1, resetOnSuccess: false })).toBe('(123123#)');
      expectObservable(shared[retry]({ count: 1, resetOnSuccess: false }), '-^').toBe('-(123123#)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be retryable when cold source is synchronous [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const syncError = new Observable((subscriber) => {
        subscriber.error(new Error());
      });
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, syncError]),
        resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
      };
      const source = observable('(123#)');
      const shared = source[share](options);
      // Preserve the original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(shared[retry]({ count: 1, resetOnSuccess: false })).toBe('(123123#)');
      expectObservable(shared[retry]({ count: 1, resetOnSuccess: false }), '-^').toBe('-(123123#)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be repeatable when cold source is synchronous [share()]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const options = {};
      const source = observable('(123|)');
      const shared = source[share](options);
      // Preserve the original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(shared[repeat]({ count: 2 })).toBe('(123123|)');
      expectObservable(shared[repeat]({ count: 2 }), '-^').toBe('-(123123|)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be repeatable when cold source is synchronous [share() using sync reset notifiers equivalent to default config]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => syncNotify,
        resetOnComplete: () => syncNotify,
        resetOnRefCountZero: () => syncNotify,
      };
      const source = observable('(123|)');
      const shared = source[share](options);
      // Preserve the original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(shared[repeat]({ count: 2 })).toBe('(123123|)');
      expectObservable(shared[repeat]({ count: 2 }), '-^').toBe('-(123123|)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be repeatable when cold source is synchronous [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
        resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
      };
      const source = observable('(123|)');
      const shared = source[share](options);
      // Preserve the original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(shared[repeat]({ count: 2 })).toBe('(123123|)');
      expectObservable(shared[repeat]({ count: 2 }), '-^').toBe('-(123123|)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be repeatable when cold source is synchronous [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, NEVER]),
        resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
      };
      const source = observable('(123|)');
      const shared = source[share](options);
      // Preserve the original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(shared[repeat]({ count: 2 })).toBe('(123123|)');
      expectObservable(shared[repeat]({ count: 2 }), '-^').toBe('-(123123|)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be repeatable when cold source is synchronous [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const syncError = new Observable((subscriber) => {
        subscriber.error(new Error());
      });
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, syncError]),
        resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
      };
      const source = observable('(123|)');
      const shared = source[share](options);
      // Preserve the original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(shared[repeat]({ count: 2 })).toBe('(123123|)');
      expectObservable(shared[repeat]({ count: 2 }), '-^').toBe('-(123123|)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be retryable [share()]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const options = {};
      const source = observable('-1-2-3----4-#                        ');
      const shared = source[share](options);
      // Subscribe at the two original hot-trigger frames without retaining
      // the trigger observations beyond the terminal retry evidence.
      expectObservable(shared[retry]({ count: 2, resetOnSuccess: false })).toBe('-1-2-3----4--1-2-3----4--1-2-3----4-#');
      expectObservable(shared[retry]({ count: 2, resetOnSuccess: false }), '----^').toBe('-----3----4--1-2-3----4--1-2-3----4-#');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should be retryable [share() using sync reset notifiers equivalent to default config]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => syncNotify,
        resetOnComplete: () => syncNotify,
        resetOnRefCountZero: () => syncNotify,
      };
      const source = observable('-1-2-3----4-#                        ');
      const shared = source[share](options);
      // Subscribe at the two original hot-trigger frames without retaining
      // the trigger observations beyond the terminal retry evidence.
      expectObservable(shared[retry]({ count: 2, resetOnSuccess: false })).toBe('-1-2-3----4--1-2-3----4--1-2-3----4-#');
      expectObservable(shared[retry]({ count: 2, resetOnSuccess: false }), '----^').toBe('-----3----4--1-2-3----4--1-2-3----4-#');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should be retryable [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
        resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
      };
      const source = observable('-1-2-3----4-#                        ');
      const shared = source[share](options);
      // Subscribe at the two original hot-trigger frames without retaining
      // the trigger observations beyond the terminal retry evidence.
      expectObservable(shared[retry]({ count: 2, resetOnSuccess: false })).toBe('-1-2-3----4--1-2-3----4--1-2-3----4-#');
      expectObservable(shared[retry]({ count: 2, resetOnSuccess: false }), '----^').toBe('-----3----4--1-2-3----4--1-2-3----4-#');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should be retryable [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, NEVER]),
        resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
      };
      const source = observable('-1-2-3----4-#                        ');
      const shared = source[share](options);
      // Subscribe at the two original hot-trigger frames without retaining
      // the trigger observations beyond the terminal retry evidence.
      expectObservable(shared[retry]({ count: 2, resetOnSuccess: false })).toBe('-1-2-3----4--1-2-3----4--1-2-3----4-#');
      expectObservable(shared[retry]({ count: 2, resetOnSuccess: false }), '----^').toBe('-----3----4--1-2-3----4--1-2-3----4-#');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should be retryable [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const syncError = new Observable((subscriber) => {
        subscriber.error(new Error());
      });
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, syncError]),
        resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
      };
      const source = observable('-1-2-3----4-#                        ');
      const shared = source[share](options);
      // Subscribe at the two original hot-trigger frames without retaining
      // the trigger observations beyond the terminal retry evidence.
      expectObservable(shared[retry]({ count: 2, resetOnSuccess: false })).toBe('-1-2-3----4--1-2-3----4--1-2-3----4-#');
      expectObservable(shared[retry]({ count: 2, resetOnSuccess: false }), '----^').toBe('-----3----4--1-2-3----4--1-2-3----4-#');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should be repeatable [share()]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const options = {};
      const source = observable('-1-2-3----4-|                        ');
      const shared = source[share](options);
      // Subscribe at the two original hot-trigger frames without retaining
      // the trigger observations beyond the terminal repeat evidence.
      expectObservable(shared[repeat]({ count: 3 })).toBe('-1-2-3----4--1-2-3----4--1-2-3----4-|');
      expectObservable(shared[repeat]({ count: 3 }), '----^').toBe('-----3----4--1-2-3----4--1-2-3----4-|');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should be repeatable [share() using sync reset notifiers equivalent to default config]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => syncNotify,
        resetOnComplete: () => syncNotify,
        resetOnRefCountZero: () => syncNotify,
      };
      const source = observable('-1-2-3----4-|                        ');
      const shared = source[share](options);
      // Subscribe at the two original hot-trigger frames without retaining
      // the trigger observations beyond the terminal repeat evidence.
      expectObservable(shared[repeat]({ count: 3 })).toBe('-1-2-3----4--1-2-3----4--1-2-3----4-|');
      expectObservable(shared[repeat]({ count: 3 }), '----^').toBe('-----3----4--1-2-3----4--1-2-3----4-|');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should be repeatable [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
        resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
      };
      const source = observable('-1-2-3----4-|                        ');
      const shared = source[share](options);
      // Subscribe at the two original hot-trigger frames without retaining
      // the trigger observations beyond the terminal repeat evidence.
      expectObservable(shared[repeat]({ count: 3 })).toBe('-1-2-3----4--1-2-3----4--1-2-3----4-|');
      expectObservable(shared[repeat]({ count: 3 }), '----^').toBe('-----3----4--1-2-3----4--1-2-3----4-|');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should be repeatable [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, NEVER]),
        resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
      };
      const source = observable('-1-2-3----4-|                        ');
      const shared = source[share](options);
      // Subscribe at the two original hot-trigger frames without retaining
      // the trigger observations beyond the terminal repeat evidence.
      expectObservable(shared[repeat]({ count: 3 })).toBe('-1-2-3----4--1-2-3----4--1-2-3----4-|');
      expectObservable(shared[repeat]({ count: 3 }), '----^').toBe('-----3----4--1-2-3----4--1-2-3----4-|');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should be repeatable [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const syncNotify = Observable.from([1]);
      const syncError = new Observable((subscriber) => {
        subscriber.error(new Error());
      });
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, syncError]),
        resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
      };
      const source = observable('-1-2-3----4-|                        ');
      const shared = source[share](options);
      // Subscribe at the two original hot-trigger frames without retaining
      // the trigger observations beyond the terminal repeat evidence.
      expectObservable(shared[repeat]({ count: 3 })).toBe('-1-2-3----4--1-2-3----4--1-2-3----4-|');
      expectObservable(shared[repeat]({ count: 3 }), '----^').toBe('-----3----4--1-2-3----4--1-2-3----4-|');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should not change the output of the observable when never [share()]', async () => {
    await rxTest(({ expectObservable }) => {
      const options = {};
      const shared = NEVER[share](options);
      // The original one-frame diagram asserts silence without completion.
      expectObservable(shared, '^!').toBe('-');
    });
  });
  it('should not change the output of the observable when never [share() using sync reset notifiers equivalent to default config]', async () => {
    await rxTest(({ expectObservable }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => syncNotify,
        resetOnComplete: () => syncNotify,
        resetOnRefCountZero: () => syncNotify,
      };
      const shared = NEVER[share](options);
      // The original one-frame diagram asserts silence without completion.
      expectObservable(shared, '^!').toBe('-');
    });
  });
  it('should not change the output of the observable when never [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    await rxTest(({ expectObservable }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
        resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
      };
      const shared = NEVER[share](options);
      // The original one-frame diagram asserts silence without completion.
      expectObservable(shared, '^!').toBe('-');
    });
  });
  it('should not change the output of the observable when never [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    await rxTest(({ expectObservable }) => {
      const syncNotify = Observable.from([1]);
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, NEVER]),
        resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
      };
      const shared = NEVER[share](options);
      // The original one-frame diagram asserts silence without completion.
      expectObservable(shared, '^!').toBe('-');
    });
  });
  it('should not change the output of the observable when never [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    await rxTest(({ expectObservable }) => {
      const syncNotify = Observable.from([1]);
      const syncError = new Observable((subscriber) => {
        subscriber.error(new Error());
      });
      const options = {
        resetOnError: () => Observable[concat]([syncNotify, syncError]),
        resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
        resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
      };
      const shared = NEVER[share](options);
      // The original one-frame diagram asserts silence without completion.
      expectObservable(shared, '^!').toBe('-');
    });
  });
  it('should not change the output of the observable when empty [share()]', async () => {
    const options = {};
    await rxTest(({ expectObservable }) => {
      const e1 = EMPTY;
      const expected = '|';
      expectObservable(e1[share](options)).toBe(expected);
    });
  });
  it('should not change the output of the observable when empty [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ expectObservable }) => {
      const e1 = EMPTY;
      const expected = '|';
      expectObservable(e1[share](options)).toBe(expected);
    });
  });
  it('should not change the output of the observable when empty [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ expectObservable }) => {
      const e1 = EMPTY;
      const expected = '|';
      expectObservable(e1[share](options)).toBe(expected);
    });
  });
  it('should not change the output of the observable when empty [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ expectObservable }) => {
      const e1 = EMPTY;
      const expected = '|';
      expectObservable(e1[share](options)).toBe(expected);
    });
  });
  it('should not change the output of the observable when empty [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ expectObservable }) => {
      const e1 = EMPTY;
      const expected = '|';
      expectObservable(e1[share](options)).toBe(expected);
    });
  });
  it('should not fail on reentrant subscription [share()]', async () => {
    const options = {};
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      // https://github.com/ReactiveX/rxjs/issues/6144
      const source = observable('(123|)');
      const subs = '       (^!)  ';
      const expected = '   (136|)';
      const deferred = new Observable((subscriber) => {
        Observable.from(shared).subscribe(subscriber, { signal: subscriber.signal });
      })[startWith](0);
      const shared = source[withLatestFrom]([deferred])
        [map](([a, b]) => String(Number(a) + Number(b)))
        [share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should not fail on reentrant subscription [share() using sync reset notifiers equivalent to default config]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => syncNotify,
      resetOnComplete: () => syncNotify,
      resetOnRefCountZero: () => syncNotify,
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      // https://github.com/ReactiveX/rxjs/issues/6144
      const source = observable('(123|)');
      const subs = '       (^!)  ';
      const expected = '   (136|)';
      const deferred = new Observable((subscriber) => {
        Observable.from(shared).subscribe(subscriber, { signal: subscriber.signal });
      })[startWith](0);
      const shared = source[withLatestFrom]([deferred])
        [map](([a, b]) => String(Number(a) + Number(b)))
        [share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should not fail on reentrant subscription [share() using sync reset notifiers equivalent to default config and notifying again after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncNotify]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncNotify]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      // https://github.com/ReactiveX/rxjs/issues/6144
      const source = observable('(123|)');
      const subs = '       (^!)  ';
      const expected = '   (136|)';
      const deferred = new Observable((subscriber) => {
        Observable.from(shared).subscribe(subscriber, { signal: subscriber.signal });
      })[startWith](0);
      const shared = source[withLatestFrom]([deferred])
        [map](([a, b]) => String(Number(a) + Number(b)))
        [share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should not fail on reentrant subscription [share() using sync reset notifiers equivalent to default config and never completing after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, NEVER]),
      resetOnComplete: () => Observable[concat]([syncNotify, NEVER]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, NEVER]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      // https://github.com/ReactiveX/rxjs/issues/6144
      const source = observable('(123|)');
      const subs = '       (^!)  ';
      const expected = '   (136|)';
      const deferred = new Observable((subscriber) => {
        Observable.from(shared).subscribe(subscriber, { signal: subscriber.signal });
      })[startWith](0);
      const shared = source[withLatestFrom]([deferred])
        [map](([a, b]) => String(Number(a) + Number(b)))
        [share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should not fail on reentrant subscription [share() using sync reset notifiers equivalent to default config and throwing an error after reset is notified]', async () => {
    const syncNotify = Observable.from([1]);
    const syncError = new Observable((subscriber) => {
      subscriber.error(new Error());
    });
    const options = {
      resetOnError: () => Observable[concat]([syncNotify, syncError]),
      resetOnComplete: () => Observable[concat]([syncNotify, syncError]),
      resetOnRefCountZero: () => Observable[concat]([syncNotify, syncError]),
    };
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      // https://github.com/ReactiveX/rxjs/issues/6144
      const source = observable('(123|)');
      const subs = '       (^!)  ';
      const expected = '   (136|)';
      const deferred = new Observable((subscriber) => {
        Observable.from(shared).subscribe(subscriber, { signal: subscriber.signal });
      })[startWith](0);
      const shared = source[withLatestFrom]([deferred])
        [map](([a, b]) => String(Number(a) + Number(b)))
        [share](options);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should not reset on error if configured to do so [share(config)]', async () => {
    const resetOnError = false;
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('---a---b---c---d---e---f----#');
      const expected = '  ---a---b---c---d---e---f----#';
      const sourceSubs = [
        '                 ^----------!                 ',
        '                 -----------^-----------!     ',
        '                 -----------------------^----!',
      ];
      const result = source[take](3)[share]({ resetOnError })[repeat]();
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not reset on error if configured to do so [share(config) using EMPTY as sync reset notifier equivalents]', async () => {
    const resetOnError = () => EMPTY;
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('---a---b---c---d---e---f----#');
      const expected = '  ---a---b---c---d---e---f----#';
      const sourceSubs = [
        '                 ^----------!                 ',
        '                 -----------^-----------!     ',
        '                 -----------------------^----!',
      ];
      const result = source[take](3)[share]({ resetOnError })[repeat]();
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not reset on error if configured to do so [share(config) using NEVER as sync reset notifier equivalents]', async () => {
    const resetOnError = () => NEVER;
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('---a---b---c---d---e---f----#');
      const expected = '  ---a---b---c---d---e---f----#';
      const sourceSubs = [
        '                 ^----------!                 ',
        '                 -----------^-----------!     ',
        '                 -----------------------^----!',
      ];
      const result = source[take](3)[share]({ resetOnError })[repeat]();
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not reset on complete if configured to do so [share(config)]', async () => {
    const resetOnComplete = false;
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('---a---b---c---#                          ');
      const expected = '   ---a---b---c------a---b---c------a---b---|';
      const sourceSubs = [
        '                  ^--------------!                          ',
        '                  ---------------^--------------!           ',
        '                  ------------------------------^----------!',
      ];
      // Used to trigger the source to complete at a given moment.
      const triggerComplete = new Subject();
      // just used to count how many values have made it through the share.
      let count = 0;
      const result = source[takeUntil](triggerComplete)
        [share]({ resetOnComplete })
        [retry]({ resetOnSuccess: false })
        [tap](() => {
          if (++count === 9) {
            // If we see the ninth value, complete the source this time.
            triggerComplete.next();
          }
        });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not reset on complete if configured to do so [share(config) using EMPTY as sync reset notifier equivalents]', async () => {
    const resetOnComplete = () => EMPTY;
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('---a---b---c---#                          ');
      const expected = '   ---a---b---c------a---b---c------a---b---|';
      const sourceSubs = [
        '                  ^--------------!                          ',
        '                  ---------------^--------------!           ',
        '                  ------------------------------^----------!',
      ];
      // Used to trigger the source to complete at a given moment.
      const triggerComplete = new Subject();
      // just used to count how many values have made it through the share.
      let count = 0;
      const result = source[takeUntil](triggerComplete)
        [share]({ resetOnComplete })
        [retry]({ resetOnSuccess: false })
        [tap](() => {
          if (++count === 9) {
            // If we see the ninth value, complete the source this time.
            triggerComplete.next();
          }
        });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not reset on complete if configured to do so [share(config) using NEVER as sync reset notifier equivalents]', async () => {
    const resetOnComplete = () => NEVER;
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('---a---b---c---#                          ');
      const expected = '   ---a---b---c------a---b---c------a---b---|';
      const sourceSubs = [
        '                  ^--------------!                          ',
        '                  ---------------^--------------!           ',
        '                  ------------------------------^----------!',
      ];
      // Used to trigger the source to complete at a given moment.
      const triggerComplete = new Subject();
      // just used to count how many values have made it through the share.
      let count = 0;
      const result = source[takeUntil](triggerComplete)
        [share]({ resetOnComplete })
        [retry]({ resetOnSuccess: false })
        [tap](() => {
          if (++count === 9) {
            // If we see the ninth value, complete the source this time.
            triggerComplete.next();
          }
        });
      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not reset on refCount 0 if configured to do so [share(config)]', async () => {
    const resetOnRefCountZero = false;
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---v---v---v---E--v---v---v---C---v----v------v---');
      const expected = '    ---v---v---v------v---v---v-------v----v----      ';
      const subscription = '^-------------------------------------------!     ';
      const sourceSubs = [
        '                   ^--------------!',
        '                   ---------------^--------------!',
        // Note this last subscription never ends, because refCount hitting zero isn't going to reset.
        '                   ------------------------------^--------------     ',
      ];
      const result = source[tap]((value) => {
        if (value === 'E') {
          throw new Error('E');
        }
      })
        [takeWhile]((value) => value !== 'C')
        [share]({ resetOnRefCountZero })
        [retry]({ resetOnSuccess: false })
        [repeat]();
      expectObservable(result, subscription).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not reset on refCount 0 if configured to do so [share(config) using EMPTY as sync reset notifier equivalents]', async () => {
    const resetOnRefCountZero = () => EMPTY;
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---v---v---v---E--v---v---v---C---v----v------v---');
      const expected = '    ---v---v---v------v---v---v-------v----v----      ';
      const subscription = '^-------------------------------------------!     ';
      const sourceSubs = [
        '                   ^--------------!',
        '                   ---------------^--------------!',
        // Note this last subscription never ends, because refCount hitting zero isn't going to reset.
        '                   ------------------------------^--------------     ',
      ];
      const result = source[tap]((value) => {
        if (value === 'E') {
          throw new Error('E');
        }
      })
        [takeWhile]((value) => value !== 'C')
        [share]({ resetOnRefCountZero })
        [retry]({ resetOnSuccess: false })
        [repeat]();
      expectObservable(result, subscription).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not reset on refCount 0 if configured to do so [share(config) using NEVER as sync reset notifier equivalents]', async () => {
    const resetOnRefCountZero = () => NEVER;
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---v---v---v---E--v---v---v---C---v----v------v---');
      const expected = '    ---v---v---v------v---v---v-------v----v----      ';
      const subscription = '^-------------------------------------------!     ';
      const sourceSubs = [
        '                   ^--------------!',
        '                   ---------------^--------------!',
        // Note this last subscription never ends, because refCount hitting zero isn't going to reset.
        '                   ------------------------------^--------------     ',
      ];
      const result = source[tap]((value) => {
        if (value === 'E') {
          throw new Error('E');
        }
      })
        [takeWhile]((value) => value !== 'C')
        [share]({ resetOnRefCountZero })
        [retry]({ resetOnSuccess: false })
        [repeat]();
      expectObservable(result, subscription).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should be referentially-transparent [share(config)]', async () => {
    const resetOnRefCountZero = false;
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source1 = observable('-1-2-3-4-5-|');
      const source1Subs = ' ^----------!';
      const expected1 = '   -1-2-3-4-5-|';
      const source2 = observable('-6-7-8-9-0-|');
      const source2Subs = ' ^----------!';
      const expected2 = '   -6-7-8-9-0-|';
      // Calls to the _operator_ must be referentially-transparent.
      const partialPipeLine = (source_1) => source_1[share]({ resetOnRefCountZero });
      // The non-referentially-transparent sharing occurs within the _operator function_
      // returned by the _operator_ and that happens when the complete pipeline is composed.
      const shared1 = partialPipeLine(source1);
      const shared2 = partialPipeLine(source2);
      expectObservable(shared1).toBe(expected1);
      expectSubscriptions(source1.subscriptions).toBe(source1Subs);
      expectObservable(shared2).toBe(expected2);
      expectSubscriptions(source2.subscriptions).toBe(source2Subs);
    });
  });
  it('should be referentially-transparent [share(config) using EMPTY as sync reset notifier equivalents]', async () => {
    const resetOnRefCountZero = () => EMPTY;
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source1 = observable('-1-2-3-4-5-|');
      const source1Subs = ' ^----------!';
      const expected1 = '   -1-2-3-4-5-|';
      const source2 = observable('-6-7-8-9-0-|');
      const source2Subs = ' ^----------!';
      const expected2 = '   -6-7-8-9-0-|';
      // Calls to the _operator_ must be referentially-transparent.
      const partialPipeLine = (source_1) => source_1[share]({ resetOnRefCountZero });
      // The non-referentially-transparent sharing occurs within the _operator function_
      // returned by the _operator_ and that happens when the complete pipeline is composed.
      const shared1 = partialPipeLine(source1);
      const shared2 = partialPipeLine(source2);
      expectObservable(shared1).toBe(expected1);
      expectSubscriptions(source1.subscriptions).toBe(source1Subs);
      expectObservable(shared2).toBe(expected2);
      expectSubscriptions(source2.subscriptions).toBe(source2Subs);
    });
  });
  it('should be referentially-transparent [share(config) using NEVER as sync reset notifier equivalents]', async () => {
    const resetOnRefCountZero = () => NEVER;
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source1 = observable('-1-2-3-4-5-|');
      const source1Subs = ' ^----------!';
      const expected1 = '   -1-2-3-4-5-|';
      const source2 = observable('-6-7-8-9-0-|');
      const source2Subs = ' ^----------!';
      const expected2 = '   -6-7-8-9-0-|';
      // Calls to the _operator_ must be referentially-transparent.
      const partialPipeLine = (source_1) => source_1[share]({ resetOnRefCountZero });
      // The non-referentially-transparent sharing occurs within the _operator function_
      // returned by the _operator_ and that happens when the complete pipeline is composed.
      const shared1 = partialPipeLine(source1);
      const shared2 = partialPipeLine(source2);
      expectObservable(shared1).toBe(expected1);
      expectSubscriptions(source1.subscriptions).toBe(source1Subs);
      expectObservable(shared2).toBe(expected2);
      expectSubscriptions(source2.subscriptions).toBe(source2Subs);
    });
  });
});
