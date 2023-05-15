import { expect } from 'chai';
import * as sinon from 'sinon';
import { TeardownLogic } from '../src/internal/types';
import { Observable, config, Subscription, Subscriber, Operator, NEVER, Subject, of, throwError, EMPTY } from 'rxjs';
import { map, filter, count, tap, combineLatestWith, concatWith, mergeWith, raceWith, zipWith, catchError, share} from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from './helpers/observableMatcher';

function expectFullObserver(val: any) {
  expect(val).to.be.a('object');
  expect(val.next).to.be.a('function');
  expect(val.error).to.be.a('function');
  expect(val.complete).to.be.a('function');
  expect(val.closed).to.be.a('boolean');
}

/** @test {Observable} */
describe('Observable', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should be constructed with a subscriber function', (done) => {
    const source = new Observable<number>(function (observer) {
      expectFullObserver(observer);
      observer.next(1);
      observer.complete();
    });

    source.subscribe(
      { next: function (x) {
        expect(x).to.equal(1);
      }, complete: done }
    );
  });

  it('should send errors thrown in the constructor down the error path', (done) => {
    new Observable<number>(() => {
      throw new Error('this should be handled');
    }).subscribe({
      error(err) {
        expect(err).to.exist.and.be.instanceof(Error).and.have.property('message', 'this should be handled');
        done();
      },
    });
  });

  it('should allow empty ctor, which is effectively a never-observable', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const result = new Observable<any>();
      expectObservable(result).toBe('-');
    });
  });

  describe('forEach', () => {
    it('should iterate and return a Promise', (done) => {
      const expected = [1, 2, 3];
      const result = of(1, 2, 3)
        .forEach((x) => {
          expect(x).to.equal(expected.shift());
        })
        .then(() => {
          done();
        });

      expect(result.then).to.be.a('function');
    });

    it('should reject promise when in error', (done) => {
      throwError(() => ('bad'))
        .forEach(() => {
          done(new Error('should not be called'));
        })
        .then(
          () => {
            done(new Error('should not complete'));
          },
          (err) => {
            expect(err).to.equal('bad');
            done();
          }
        );
    });

    it('should reject promise if nextHandler throws', (done) => {
      const results: number[] = [];

      of(1, 2, 3)
        .forEach((x) => {
          if (x === 3) {
            throw new Error('NO THREES!');
          }
          results.push(x);
        })
        .then(
          () => {
            done(new Error('should not be called'));
          },
          (err) => {
            expect(err).to.be.an('error', 'NO THREES!');
            expect(results).to.deep.equal([1, 2]);
          }
        )
        .then(() => {
          done();
        });
    });

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
    it('should work with handlers with hacked bind methods', () => {
      const source = of('Hi');
      const results: any[] = [];
      const next = function (value: string) {
        results.push(value);
      }
      next.bind = () => { /* lol */};

      const complete = function () {
        results.push('done');
      }
      complete.bind = () => { /* lol */};

      source.subscribe({ next, complete });
      expect(results).to.deep.equal(['Hi', 'done']);
    });

    it('should work with handlers with hacked bind methods, in the error case', () => {
      const source = throwError(() => 'an error');
      const results: any[] = [];
      const error = function (value: string) {
        results.push(value);
      }

      source.subscribe({ error });
      expect(results).to.deep.equal(['an error']);
    });

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

      source.subscribe(
        { next: (x) => {
          nexted = x;
          mutatedByNext = true;
        }, complete: () => {
          completed = true;
          mutatedByComplete = true;
        } }
      );

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

    it('should not be unsubscribed when other empty subscription completes', () => {
      let unsubscribeCalled = false;
      const source = new Observable<number>(() => {
        return () => {
          unsubscribeCalled = true;
        };
      });

      source.subscribe();

      expect(unsubscribeCalled).to.be.false;

      EMPTY.subscribe();

      expect(unsubscribeCalled).to.be.false;
    });

    it('should not be unsubscribed when other subscription with same observer completes', () => {
      let unsubscribeCalled = false;
      const source = new Observable<number>(() => {
        return () => {
          unsubscribeCalled = true;
        };
      });

      let observer = {
        next: function () {
          /*noop*/
        },
      };

      source.subscribe(observer);

      expect(unsubscribeCalled).to.be.false;

      EMPTY.subscribe(observer);

      expect(unsubscribeCalled).to.be.false;
    });

    it('should run unsubscription logic when an error is sent asynchronously and subscribe is called with no arguments', (done) => {
      const sandbox = sinon.createSandbox();
      const fakeTimer = sandbox.useFakeTimers();

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
            done(err);
          }
        }
      }, 100);

      fakeTimer.tick(110);
      sandbox.restore();
    });

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

    it('should ignore next messages after unsubscription', (done) => {
      let times = 0;

      const subscription = new Observable<number>((observer) => {
        let i = 0;
        const id = setInterval(() => {
          observer.next(i++);
        });

        return () => {
          clearInterval(id);
          expect(times).to.equal(2);
          done();
        };
      })
        .pipe(tap(() => (times += 1)))
        .subscribe(function () {
          if (times === 2) {
            subscription.unsubscribe();
          }
        });
    });

    it('should ignore error messages after unsubscription', (done) => {
      let times = 0;
      let errorCalled = false;

      const subscription = new Observable<number>((observer) => {
        let i = 0;
        const id = setInterval(() => {
          observer.next(i++);
          if (i === 3) {
            observer.error(new Error());
          }
        });

        return () => {
          clearInterval(id);
          expect(times).to.equal(2);
          expect(errorCalled).to.be.false;
          done();
        };
      })
        .pipe(tap(() => (times += 1)))
        .subscribe(
          { next: function () {
            if (times === 2) {
              subscription.unsubscribe();
            }
          }, error: function () {
            errorCalled = true;
          } }
        );
    });

    it('should ignore complete messages after unsubscription', (done) => {
      let times = 0;
      let completeCalled = false;

      const subscription = new Observable<number>((observer) => {
        let i = 0;
        const id = setInterval(() => {
          observer.next(i++);
          if (i === 3) {
            observer.complete();
          }
        });

        return () => {
          clearInterval(id);
          expect(times).to.equal(2);
          expect(completeCalled).to.be.false;
          done();
        };
      })
        .pipe(tap(() => (times += 1)))
        .subscribe(
          { next: function () {
            if (times === 2) {
              subscription.unsubscribe();
            }
          }, complete: function () {
            completeCalled = true;
          } }
        );
    });

    describe('when called with an anonymous observer', () => {
      it(
        'should accept an anonymous observer with just a next function and call the next function in the context' +
          ' of the anonymous observer',
        (done) => {
          //intentionally not using lambda to avoid typescript's this context capture
          const o = {
            myValue: 'foo',
            next(x: any) {
              expect(this.myValue).to.equal('foo');
              expect(x).to.equal(1);
              done();
            },
          };

          of(1).subscribe(o);
        }
      );

      it(
        'should accept an anonymous observer with just an error function and call the error function in the context' +
          ' of the anonymous observer',
        (done) => {
          //intentionally not using lambda to avoid typescript's this context capture
          const o = {
            myValue: 'foo',
            error(err: any) {
              expect(this.myValue).to.equal('foo');
              expect(err).to.equal('bad');
              done();
            },
          };

          throwError(() => ('bad')).subscribe(o);
        }
      );

      it(
        'should accept an anonymous observer with just a complete function and call the complete function in the' +
          ' context of the anonymous observer',
        (done) => {
          //intentionally not using lambda to avoid typescript's this context capture
          const o = {
            myValue: 'foo',
            complete: function complete() {
              expect(this.myValue).to.equal('foo');
              done();
            },
          };

          EMPTY.subscribe(o);
        }
      );

      it('should accept an anonymous observer with no functions at all', () => {
        expect(() => {
          EMPTY.subscribe(<any>{});
        }).not.to.throw();
      });

      it('should ignore next messages after unsubscription', (done) => {
        let times = 0;

        const subscription = new Observable<number>((observer) => {
          let i = 0;
          const id = setInterval(() => {
            observer.next(i++);
          });

          return () => {
            clearInterval(id);
            expect(times).to.equal(2);
            done();
          };
        })
          .pipe(tap(() => (times += 1)))
          .subscribe({
            next() {
              if (times === 2) {
                subscription.unsubscribe();
              }
            },
          });
      });

      it('should ignore error messages after unsubscription', (done) => {
        let times = 0;
        let errorCalled = false;

        const subscription = new Observable<number>((observer) => {
          let i = 0;
          const id = setInterval(() => {
            observer.next(i++);
            if (i === 3) {
              observer.error(new Error());
            }
          });
          return () => {
            clearInterval(id);
            expect(times).to.equal(2);
            expect(errorCalled).to.be.false;
            done();
          };
        })
          .pipe(tap(() => (times += 1)))
          .subscribe({
            next() {
              if (times === 2) {
                subscription.unsubscribe();
              }
            },
            error() {
              errorCalled = true;
            },
          });
      });

      it('should ignore complete messages after unsubscription', (done) => {
        let times = 0;
        let completeCalled = false;

        const subscription = new Observable<number>((observer) => {
          let i = 0;
          const id = setInterval(() => {
            observer.next(i++);
            if (i === 3) {
              observer.complete();
            }
          });

          return () => {
            clearInterval(id);
            expect(times).to.equal(2);
            expect(completeCalled).to.be.false;
            done();
          };
        })
          .pipe(tap(() => (times += 1)))
          .subscribe({
            next() {
              if (times === 2) {
                subscription.unsubscribe();
              }
            },
            complete() {
              completeCalled = true;
            },
          });
      });
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
        error: () => { /* do nothing */ }
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
        }
      });
      expect(caught).to.be.true;
    });
  });

  describe('pipe', () => {
    it('should exist', () => {
      const source = of('test');
      expect(source.pipe).to.be.a('function');
    });

    it('should pipe multiple operations', (done) => {
      of('test')
        .pipe(
          map((x) => x + x),
          map((x) => x + '!!!')
        )
        .subscribe(
          { next: (x) => {
            expect(x).to.equal('testtest!!!');
          }, complete: done }
        );
    });

    it('should return the same observable if there are no arguments', () => {
      const source = of('test');
      const result = source.pipe();
      expect(result).to.equal(source);
    });

    it('should allow any kind of piped function', () => {
      const source = of('test');
      const result = source.pipe(
        source => source instanceof Observable, 
        isObservable => isObservable ? 'Well hello, there.' : 'Huh?'
      );
      expect(result).to.equal('Well hello, there.');
    })
  });

  it('should not swallow internal errors', (done) => {
    config.onStoppedNotification = (notification) => {
      expect(notification.kind).to.equal('E');
      expect(notification).to.have.property('error', 'bad');
      config.onStoppedNotification = null;
      done();
    };

    new Observable(subscriber => {
      subscriber.error('test');
      throw 'bad';
    }).subscribe({
      error: err => {
        expect(err).to.equal('test');
      }
    });
  });

  // Discussion here: https://github.com/ReactiveX/rxjs/issues/5370
  it.skip('should handle sync errors within a test scheduler', () => {
    const observable = of(4).pipe(
      map(n => {
          if (n === 4) {
            throw 'four!';
        }
        return n;
      }),
      catchError((err, source) => source),
    );

    rxTestScheduler.run(helpers => {
      const { expectObservable } = helpers;
      expectObservable(observable).toBe('-');
    });
  });

  it('should emit an error for unhandled synchronous exceptions from something like a stack overflow', () => {
    const source = new Observable(() => {
      const boom = (): unknown => boom();
      boom();
    });

    let thrownError: any = undefined;
    source.subscribe({
      error: err => thrownError = err
    });

    expect(thrownError).to.be.an.instanceOf(RangeError);
    expect(thrownError.message).to.equal('Maximum call stack size exceeded');
  });
});

