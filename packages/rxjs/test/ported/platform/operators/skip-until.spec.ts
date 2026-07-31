// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/skipUntil-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { skipUntil } from 'rxjs/skip-until';
describe('skipUntil (platform)', () => {
  it('should skip values until another observable notifies', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a--b--c--d--e----|');
      const e1subs = '    ^------------------!';
      const skip = hot('  ---------x------|   ');
      const skipSubs = '  ^--------!          ';
      const expected = '  -----------d--e----|';
      expectObservable(e1[skipUntil](skip)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should emit elements after notifier emits', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a--b--c--d--e--|');
      const e1subs = '    ^----------------!';
      const skip = hot('  ---------x----|   ');
      const skipSubs = '  ^--------!        ';
      const expected = '  -----------d--e--|';
      expectObservable(e1[skipUntil](skip)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should raise an error if notifier throws and source is hot', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^------------!    ';
      const skip = hot('-------------#    ');
      const skipSubs = '^------------!    ';
      const expected = '-------------#    ';
      expectObservable(e1[skipUntil](skip)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should skip all elements when notifier does not emit and completes early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^----------------!';
      const skip = hot('------------|     ');
      const skipSubs = '^-----------!     ';
      const expected = '-----------------|';
      expectObservable(e1[skipUntil](skip)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a--b--c--d--e----|');
      const unsub = '     ---------!          ';
      const e1subs = '    ^--------!          ';
      const skip = hot('  -------------x--|   ');
      const skipSubs = '  ^--------!          ';
      const expected = '  ----------          ';
      expectObservable(e1[skipUntil](skip), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a--b--c--d--e----|');
      const e1subs = '    ^--------!          ';
      const skip = hot('  -------------x--|   ');
      const skipSubs = '  ^--------!          ';
      const expected = '  ----------          ';
      const unsub = '     ---------!          ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [skipUntil](skip)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should not break unsubscription chains with interop inners when result is unsubscribed explicitly', async () => {
    const asInteropObservable = (source) =>
      new Proxy(source, {
        get(target, key) {
          if (key === 'subscribe') {
            return (...args) => Reflect.apply(target.subscribe, target, args);
          }
          return Reflect.get(target, key, target);
        },
        getPrototypeOf(target) {
          const prototype = Reflect.getPrototypeOf(target);
          return { ...prototype, subscribe: (...args) => Reflect.apply(target.subscribe, target, args) };
        },
      });
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a--b--c--d--e----|');
      const e1subs = '    ^--------!          ';
      const skip = hot('  -------------x--|   ');
      const skipSubs = '  ^--------!          ';
      const expected = '  ----------          ';
      const unsub = '     ---------!          ';
      // This test is the same as the previous test, but the observable is
      // manipulated to make it look like an interop observable - an observable
      // from a foreign library. Interop subscribers are treated differently:
      // they are wrapped in a safe subscriber. This test ensures that
      // unsubscriptions are chained all the way to the interop subscriber.
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [skipUntil](asInteropObservable(skip))
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should skip all elements when notifier is empty', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   --a--b--c--d--e--|');
      const e1subs = '   ^----------------!';
      const skip = observable('|                 ');
      const skipSubs = ' (^!)              ';
      const expected = ' -----------------|';
      expectObservable(e1[skipUntil](skip)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should keep subscription to source, to wait for its eventual completion', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ------------------------------|');
      const e1subs = '  ^-----------------------------!';
      const skip = hot('-------|                       ');
      const skipSubs = '^------!                       ';
      const expected = '------------------------------|';
      expectObservable(e1[skipUntil](skip)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should not complete if hot source observable does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -                ');
      const e1subs = '^---------------!';
      const skip = hot('-------------x--|');
      const skipSubs = '^------------!   ';
      const expected = '-                ';
      expectObservable(e1[skipUntil](skip), '^---------------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should not complete if cold source observable never completes', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -                ');
      const e1subs = '^---------------!';
      const skip = hot('-------------x--|');
      const skipSubs = '^------------!   ';
      const expected = '-                ';
      expectObservable(e1[skipUntil](skip), '^---------------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should raise error if cold source is never and notifier errors', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -             ');
      const e1subs = '  ^------------!';
      const skip = hot('-------------#');
      const skipSubs = '^------------!';
      const expected = '-------------#';
      expectObservable(e1[skipUntil](skip)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should skip all elements and complete if notifier is cold never', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   --a--b--c--d--e--|');
      const e1subs = '   ^----------------!';
      const skip = observable('-                 ');
      const skipSubs = ' ^----------------!';
      const expected = ' -----------------|';
      expectObservable(e1[skipUntil](skip)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should skip all elements and complete if notifier is a hot never', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = '  ^----------------!';
      const skip = hot('-                 ');
      const skipSubs = '^----------------!';
      const expected = '-----------------|';
      expectObservable(e1[skipUntil](skip)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should skip all elements and complete, even if notifier would not complete until later', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ^-a--b--c--d--e--|       ');
      const e1subs = '  ^----------------!       ';
      const skip = hot('^-----------------------|');
      const skipSubs = '^----------------!       ';
      const expected = '-----------------|       ';
      expectObservable(e1[skipUntil](skip)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should not complete if source does not complete if notifier completes without emission', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -              ');
      const e1subs = '^-------------!';
      const skip = hot('--------------|');
      const skipSubs = '^-------------!';
      const expected = '-              ';
      expectObservable(e1[skipUntil](skip), '^-------------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should not complete if source and notifier are both hot never', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '^!';
      const skip = hot('-');
      const skipSubs = '^!';
      const expected = '-';
      expectObservable(e1[skipUntil](skip), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
  });
  it('should skip all elements if notifier is unsubscribed explicitly before the notifier emits', async () => {
    const notifierController = new AbortController();
    let notifierSink = null;
    let notifierCancellationCount = 0;
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const e1subs = ['               ^----------------!', '               ^----------------!'];
      // The legacy Subject fixture exposed unsubscribe() on the producer itself.
      // Model that cancellation at the platform AbortSignal boundary: detaching
      // the producer sink sends no next, error, or complete notification, so the
      // skipUntil gate must remain closed until the source completes.
      const skip = new Observable((subscriber) => {
        notifierSink = subscriber;
        const cancelNotifier = () => {
          notifierCancellationCount++;
          notifierSink = null;
        };
        notifierController.signal.addEventListener('abort', cancelNotifier, { once: true });
        subscriber.addTeardown(() => {
          notifierController.signal.removeEventListener('abort', cancelNotifier);
          notifierSink = null;
        });
      });
      const expected = '-----------------|';
      e1.subscribe((value) => {
        if (value === 'd' && !notifierController.signal.aborted) {
          notifierSink?.next('x');
        }
        notifierController.abort();
      });
      expectObservable(e1[skipUntil](skip)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    expect(notifierController.signal.aborted).toBe(true);
    expect(notifierCancellationCount).toBe(1);
    expect(notifierSink).toBe(null);
  });
  it('should unsubscribe the notifier after its first nexted value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('  -^-o---o---o---o---o---o---|');
      const notifier = hot('-^--------n--n--n--n--n--n-|');
      const nSubs = '        ^--------!                 ';
      const expected = '----------o---o---o---o---|';
      const result = source[skipUntil](notifier);
      expectObservable(result).toBe(expected);
      expectSubscriptions(notifier.subscriptions).toBe(nSubs);
    });
  });
});
