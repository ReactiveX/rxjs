import { describe, expect, it, vi } from 'vitest';
import { Observable, Subscription, config } from './observable.js';

function expectFullObserver(val: any) {
  expect(val).to.be.a('object');
  expect(val.next).to.be.a('function');
  expect(val.error).to.be.a('function');
  expect(val.complete).to.be.a('function');
  expect(val.closed).to.be.a('boolean');
}

/** @test {Observable} */
describe('Observable', () => {
  it('should be constructed with a subscriber function', () =>
    new Promise<void>((done) => {
      const source = new Observable<number>(function (observer) {
        expectFullObserver(observer);
        observer.next(1);
        observer.complete();
      });

      source.subscribe({
        next: function (x) {
          expect(x).to.equal(1);
        },
        complete: done,
      });
    }));

  it('should send errors thrown in the constructor down the error path', () =>
    new Promise<void>((done) => {
      new Observable<number>(() => {
        throw new Error('this should be handled');
      }).subscribe({
        error(err) {
          expect(err).to.exist.and.be.instanceof(Error).and.have.property('message', 'this should be handled');
          done();
        },
      });
    }));

  describe('forEach', () => {
    it('should handle a synchronous throw from the next handler', () => {
      const expected = new Error('I told, you Bobby Boucher, threes are the debil!');
      const syncObservable = new Observable<number>((observer) => {
        observer.next(1);
        observer.next(2);
        observer.next(3);
        observer.next(4);
      });

      const results: Array<number | Error> = [];

      return syncObservable
        .forEach((x) => {
          results.push(x);
          if (x === 3) {
            throw expected;
          }
        })
        .then(
          () => {
            throw new Error('should not be called');
          },
          (err) => {
            results.push(err);
            // The error should unsubscribe from the source, meaning we
            // should not see the number 4.
            expect(results).to.deep.equal([1, 2, 3, expected]);
          }
        );
    });

    it('should handle an asynchronous throw from the next handler and tear down', () => {
      const expected = new Error('I told, you Bobby Boucher, twos are the debil!');
      const asyncObservable = new Observable<number>((observer) => {
        let i = 1;
        const id = setInterval(() => observer.next(i++), 1);

        return () => {
          clearInterval(id);
        };
      });

      const results: Array<number | Error> = [];

      return asyncObservable
        .forEach((x) => {
          results.push(x);
          if (x === 2) {
            throw expected;
          }
        })
        .then(
          () => {
            throw new Error('should not be called');
          },
          (err) => {
            results.push(err);
            expect(results).to.deep.equal([1, 2, expected]);
          }
        );
    });
  });

  describe('subscribe', () => {
    it('should be synchronous', () => {
      let subscribed = false;
      let nexted: string;
      let completed: boolean;
      const source = new Observable<string>((observer) => {
        subscribed = true;
        observer.next('wee');
        expect(nexted).to.equal('wee');
        observer.complete();
        expect(completed).to.be.true;
      });

      expect(subscribed).to.be.false;

      let mutatedByNext = false;
      let mutatedByComplete = false;

      source.subscribe({
        next: (x) => {
          nexted = x;
          mutatedByNext = true;
        },
        complete: () => {
          completed = true;
          mutatedByComplete = true;
        },
      });

      expect(mutatedByNext).to.be.true;
      expect(mutatedByComplete).to.be.true;
    });

    it('should work when subscribe is called with no arguments', () => {
      const source = new Observable<string>((subscriber) => {
        subscriber.next('foo');
        subscriber.complete();
      });

      source.subscribe();
    });

    it('should run unsubscription logic when an error is sent asynchronously and subscribe is called with no arguments', () =>
      new Promise<void>((done, fail) => {
        const fakeTimer = vi.useFakeTimers();

        let unsubscribeCalled = false;
        const source = new Observable<number>((observer) => {
          const id = setInterval(() => {
            observer.error(0);
          }, 1);
          return () => {
            clearInterval(id);
            unsubscribeCalled = true;
          };
        });

        source.subscribe({
          error() {
            /* noop: expected error */
          },
        });

        setTimeout(() => {
          let err;
          let errHappened = false;
          try {
            expect(unsubscribeCalled).to.be.true;
          } catch (e) {
            err = e;
            errHappened = true;
          } finally {
            if (!errHappened) {
              done();
            } else {
              fail(err);
            }
          }
        }, 100);

        fakeTimer.advanceTimersByTime(110);
        vi.useRealTimers();
      }));

    it('should return a Subscription that calls the unsubscribe function returned by the subscriber', () => {
      let unsubscribeCalled = false;

      const source = new Observable<number>(() => {
        return () => {
          unsubscribeCalled = true;
        };
      });

      const sub = source.subscribe(() => {
        //noop
      });
      expect(sub instanceof Subscription).to.be.true;
      expect(unsubscribeCalled).to.be.false;
      expect(sub.unsubscribe).to.be.a('function');

      sub.unsubscribe();
      expect(unsubscribeCalled).to.be.true;
    });

    it('should finalize even with a synchronous thrown error', () => {
      let called = false;
      const badObservable = new Observable((subscriber) => {
        subscriber.add(() => {
          called = true;
        });

        throw new Error('bad');
      });

      badObservable.subscribe({
        error: () => {
          /* do nothing */
        },
      });

      expect(called).to.be.true;
    });

    it('should handle empty string sync errors', () => {
      const badObservable = new Observable(() => {
        throw '';
      });

      let caught = false;
      badObservable.subscribe({
        error: (err) => {
          caught = true;
          expect(err).to.equal('');
        },
      });
      expect(caught).to.be.true;
    });
  });

  it('should emit an error for unhandled synchronous exceptions from something like a stack overflow', () => {
    const source = new Observable(() => {
      const boom = (): unknown => boom();
      boom();
    });

    let thrownError: any = undefined;
    source.subscribe({
      error: (err) => (thrownError = err),
    });

    expect(thrownError).to.be.an.instanceOf(RangeError);
    expect(thrownError.message).to.equal('Maximum call stack size exceeded');
  });

  describe('pipe', () => {
    it('should not swallow internal errors', () =>
      new Promise<void>((done) => {
        config.onStoppedNotification = (notification) => {
          expect(notification.kind).to.equal('E');
          expect(notification).to.have.property('error', 'bad');
          config.onStoppedNotification = null;
          done();
        };

        new Observable((subscriber) => {
          subscriber.error('test');
          throw 'bad';
        }).subscribe({
          error: (err) => {
            expect(err).to.equal('test');
          },
        });
      }));
  });

  describe('As an async iterable', () => {
    it('should be able to be used with for-await-of', async () => {
      const source = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.complete();
      });

      const results: number[] = [];
      for await (const value of source) {
        results.push(value);
      }

      expect(results).to.deep.equal([1, 2, 3]);
    });

    it('should unsubscribe if the for-await-of loop is broken', async () => {
      let activeSubscriptions = 0;

      const source = new Observable<number>((subscriber) => {
        activeSubscriptions++;

        subscriber.next(1);
        subscriber.next(2);

        // NOTE that we are NOT calling `subscriber.complete()` here.
        // therefore the teardown below would never be called naturally
        // by the observable unless it was unsubscribed.
        return () => {
          activeSubscriptions--;
        };
      });

      const results: number[] = [];
      for await (const value of source) {
        results.push(value);
        break;
      }

      expect(results).to.deep.equal([1]);
      expect(activeSubscriptions).to.equal(0);
    });

    it('should unsubscribe if the for-await-of loop is broken with a thrown error', async () => {
      const source = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.complete();
      });

      const results: number[] = [];

      try {
        for await (const value of source) {
          results.push(value);
          throw new Error('wee');
        }
      } catch {
        // Ignore
      }

      expect(results).to.deep.equal([1]);
    });

    it('should cause the async iterator to throw if the observable errors', async () => {
      const source = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.error(new Error('wee'));
      });

      const results: number[] = [];
      let thrownError: any;

      try {
        for await (const value of source) {
          results.push(value);
        }
      } catch (err: any) {
        thrownError = err;
      }

      expect(thrownError?.message).to.equal('wee');
      expect(results).to.deep.equal([1, 2]);
    });

    it('should unsubscribe from the source observable if `return` is called on the generator returned by Symbol.asyncIterator', async () => {
      let state = 'idle';
      const source = new Observable<number>((subscriber) => {
        state = 'subscribed';
        return () => {
          state = 'unsubscribed';
        };
      });

      const asyncIterator = source[Symbol.asyncIterator]();
      expect(state).to.equal('idle');
      asyncIterator.next();
      expect(state).to.equal('subscribed');
      asyncIterator.return();
      expect(state).to.equal('unsubscribed');
    });

    it('should unsubscribe from the source observable if `throw` is called on the generator returned by Symbol.asyncIterator', async () => {
      let state = 'idle';
      const source = new Observable<number>((subscriber) => {
        state = 'subscribed';
        subscriber.next(0);
        return () => {
          state = 'unsubscribed';
        };
      });

      const asyncIterator = source[Symbol.asyncIterator]();
      expect(state).to.equal('idle');
      await asyncIterator.next();
      expect(state).to.equal('subscribed');
      try {
        await asyncIterator.throw(new Error('wee!'));
      } catch (err: any) {
        expect(err.message).to.equal('wee!');
      }
      expect(state).to.equal('unsubscribed');
    });
  });
});
