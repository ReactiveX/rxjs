import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { repeatWhen, map, mergeMap, takeUntil, takeWhile, take } from 'rxjs/operators';
import { of, EMPTY, Observable, Subscriber } from 'rxjs';
import { SafeSubscriber } from 'rxjs/internal/Subscriber';

/** @test {repeatWhen} */
describe('repeatWhen operator', () => {
  it('should handle a source with eventual complete using a hot notifier', () => {
    const source =  cold('-1--2--|');
    const subs =        ['^      !                     ',
                       '             ^      !        ',
                       '                          ^      !'];
    const notifier = hot('-------------r------------r-|');
    const expected =     '-1--2---------1--2---------1--2--|';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a source with eventual complete using a hot notifier that raises error', () => {
    const source = cold( '-1--2--|');
    const subs =        ['^      !                    ',
                       '           ^      !           ',
                       '                   ^      !   '];
    const notifier = hot('-----------r-------r---------#');
    const expected =     '-1--2-------1--2----1--2-----#';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should repeat when notified via returned notifier on complete', (done) => {
    let retried = false;
    const expected = [1, 2, 1, 2];
    let i = 0;
    try {
    of(1, 2).pipe(
      map((n: number) => {
        return n;
      }),
      repeatWhen((notifications: any) => notifications.pipe(map((x: any) => {
          if (retried) {
            throw new Error('done');
          }
          retried = true;
          return x;
      })))
    ).subscribe((x: any) => {
        expect(x).to.equal(expected[i++]);
      },
      (err: any) => {
        expect(err).to.be.an('error', 'done');
        done();
      });
    } catch (err) {
      done(err);
    }
  });

  it('should not repeat when applying an empty notifier', (done) => {
    const expected = [1, 2];
    const nexted: number[] = [];
    of(1, 2).pipe(
      map((n: number) => {
        return n;
      }),
      repeatWhen((notifications: any) => EMPTY)
    ).subscribe((n: number) => {
        expect(n).to.equal(expected.shift());
        nexted.push(n);
      }, (err: any) => {
        done(new Error('should not be called'));
      }, () => {
        expect(nexted).to.deep.equal([1, 2]);
        done();
      });
  });

  it('should not error when applying an empty synchronous notifier', () => {
    const errors: any[] = [];
    // The current Subscriber.prototype.error implementation does nothing for
    // stopped subscribers. This test was written to fail and expose a problem
    // with synchronous notifiers. However, by the time the error occurs the
    // subscriber is stopped, so the test logs errors by both patching the
    // prototype and by using an error callback (for when/if the do-nothing-if-
    // stopped behaviour is fixed).
    const originalSubscribe = Observable.prototype.subscribe;
    Observable.prototype.subscribe = function (...args: any[]): any {
      let [subscriber] = args;
      if (!(subscriber instanceof Subscriber)) {
        subscriber = new SafeSubscriber(...args);
      }
      subscriber.error = function (err: any): void {
        errors.push(err);
        Subscriber.prototype.error.call(this, err);
      };
      return originalSubscribe.call(this, subscriber);
    };
    of(1, 2).pipe(
      repeatWhen((notifications: any) => EMPTY)
    ).subscribe(undefined, err => errors.push(err));
    Observable.prototype.subscribe = originalSubscribe;
    expect(errors).to.deep.equal([]);
  });

  it('should not error when applying a non-empty synchronous notifier', () => {
    const errors: any[] = [];
    // The current Subscriber.prototype.error implementation does nothing for
    // stopped subscribers. This test was written to fail and expose a problem
    // with synchronous notifiers. However, by the time the error occurs the
    // subscriber is stopped, so the test logs errors by both patching the
    // prototype and by using an error callback (for when/if the do-nothing-if-
    // stopped behaviour is fixed).
    const originalSubscribe = Observable.prototype.subscribe;
    Observable.prototype.subscribe = function (...args: any[]): any {
      let [subscriber] = args;
      if (!(subscriber instanceof Subscriber)) {
        subscriber = new SafeSubscriber(...args);
      }
      subscriber.error = function (err: any): void {
        errors.push(err);
        Subscriber.prototype.error.call(this, err);
      };
      return originalSubscribe.call(this, subscriber);
    };
    of(1, 2).pipe(
      repeatWhen((notifications: any) => of(1))
    ).subscribe(undefined, err => errors.push(err));
    Observable.prototype.subscribe = originalSubscribe;
    expect(errors).to.deep.equal([]);
  });

  it('should apply an empty notifier on an empty source', () => {
    const source = cold(  '|');
    const subs =          '(^!)';
    const notifier = cold('|');
    const expected =      '|';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should apply a never notifier on an empty source', () => {
    const source = cold(  '|');
    const subs =          '(^!)';
    const notifier = cold('-');
    const expected =      '-';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should apply an empty notifier on a never source', () => {
    const source = cold(  '-');
    const unsub =         '                                         !';
    const subs =          '^                                        !';
    const notifier = cold('|');
    const expected =      '-';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should apply a never notifier on a never source', () => {
    const source = cold(  '-');
    const unsub =         '                                         !';
    const subs =          '^                                        !';
    const notifier = cold('-');
    const expected =      '-';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return an empty observable given a just-throw source and empty notifier', () => {
    const source = cold(  '#');
    const notifier = cold('|');
    const expected =      '#';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result).toBe(expected);
  });

  it('should return a error observable given a just-throw source and never notifier', () => {
    const source = cold(  '#');
    const notifier = cold('-');
    const expected =      '#';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result).toBe(expected);
  });

  it('should return a never-ending result if the notifier is never', () => {
    const source = cold(  '--a--b--c--|');
    const subs =          '^          !';
    const notifier = cold(           '-');
    const expected =      '--a--b--c---------------------------------';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should propagate error thrown from notifierSelector function', () => {
    const source = cold('--a--b--c--|');
    const subs =        '^          !';
    const expected =    '--a--b--c--#';

    const result = source.pipe(repeatWhen(<any>(() => { throw 'bad!'; })));

    expectObservable(result).toBe(expected, undefined, 'bad!');
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should complete if the notifier only completes', () => {
    const source = cold(  '--a--b--c--|');
    const subs =          '^          !';
    const notifier = cold(           '|');
    const expected =      '--a--b--c--|';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should mirror a basic cold source with complete, given a never notifier', () => {
    const source = cold(  '--a--b--c--|');
    const subs =          '^          !';
    const notifier = cold(           '|');
    const expected =      '--a--b--c--|';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should mirror a basic cold source with no termination, given a never notifier', () => {
    const source = cold(  '--a--b--c---');
    const subs =          '^           ';
    const notifier = cold(           '|');
    const expected =      '--a--b--c---';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should mirror a basic hot source with complete, given a never notifier', () => {
    const source = hot('-a-^--b--c--|');
    const subs =          '^        !';
    const notifier = cold(         '|');
    const expected =      '---b--c--|';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  // https://github.com/ReactiveX/rxjs/issues/6523
  it.skip('should handle a host source that completes via operator like take, and a hot notifier', () => {
    const source =   hot('-1--2--3----4--5---|');
    const ssubs =       ['^      !            ',
                       '              ^    !'];
    const notifier = hot('--------------r--------r---r--r--r---|');
    const nsubs =        '       ^           !';
    const expected =     '-1--2---      -5---|';

    const result = source.pipe(
      takeWhile(value => value !== '3'),
      repeatWhen(() => notifier)
    );

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(ssubs);
    expectSubscriptions(notifier.subscriptions).toBe(nsubs);
  });

  it('should tear down resources when result is unsubscribed early', () => {
    const source = cold( '-1--2--|');
    const unsub =        '                    !       ';
    const subs =        ['^      !                    ',
                       '         ^      !           ',
                       '                 ^  !       '];
    const notifier = hot('---------r-------r---------#');
    const nsubs =        '       ^            !       ';
    const expected =     '-1--2-----1--2----1--       ';

    const result = source.pipe(repeatWhen((notifications: any) => notifier));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(notifier.subscriptions).toBe(nsubs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const source = cold( '-1--2--|');
    const subs =        ['^      !                    ',
                       '         ^      !           ',
                       '                 ^  !       '];
    const notifier = hot('---------r-------r-------r-#');
    const nsubs =        '       ^            !       ';
    const expected =     '-1--2-----1--2----1--       ';
    const unsub =        '                    !       ';

    const result = source.pipe(
      mergeMap((x: string) => of(x)),
      repeatWhen((notifications: any) => notifier),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(notifier.subscriptions).toBe(nsubs);
  });

  it('should handle a source with eventual error using a dynamic notifier ' +
  'selector which eventually throws', () => {
    const source = cold('-1--2--|');
    const subs =       ['^      !              ',
                      '       ^      !       ',
                      '              ^      !'];
    const expected =    '-1--2---1--2---1--2--#';

    let invoked = 0;
    const result = source.pipe(repeatWhen((notifications: any) =>
      notifications.pipe(map((err: any) => {
        if (++invoked === 3) {
          throw 'error';
        } else {
          return 'x';
        }
      }))));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a source with eventual error using a dynamic notifier ' +
  'selector which eventually completes', () => {
    const source = cold('-1--2--|');
    const subs =       ['^      !              ',
                      '       ^      !       ',
                      '              ^      !'];
    const expected =    '-1--2---1--2---1--2--|';

    let invoked = 0;
    const result = source.pipe(
      repeatWhen((notifications: any) => notifications.pipe(
        map(() => 'x'),
        takeUntil(
          notifications.pipe(mergeMap(() => {
            if (++invoked < 3) {
              return EMPTY;
            } else {
              return of('stop!');
            }
          }))
      )))
    );

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should always teardown before starting the next cycle, even when synchronous', () => {
    const results: any[] = [];
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
      return () => {
        results.push('teardown');
      }
    });
    const subscription = source.pipe(repeatWhen(completions$ => completions$.pipe(
      takeWhile((_, i) => i < 3)
    ))).subscribe({
      next: value => results.push(value),
      complete: () => results.push('complete')
    });

    expect(subscription.closed).to.be.true;
    expect(results).to.deep.equal([1, 2, 'teardown', 1, 2, 'teardown', 1, 2, 'teardown', 1, 2, 'complete', 'teardown'])
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>(subscriber => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(
      repeatWhen(() => of(0)),
      take(3),
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
