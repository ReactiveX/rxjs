import { expect } from 'chai';
import * as sinon from 'sinon';
import { Observer, TeardownLogic } from '../src/internal/types';
import { Observable, config, Subscription, noop, Subscriber, Operator, NEVER, Subject, of, throwError, empty } from 'rxjs';
import { map, multicast, refCount, filter, count, tap, combineLatest, concat, merge, race, zip, catchError, concatMap, switchMap, publish, publishLast, publishBehavior, share, finalize} from 'rxjs/operators';
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
      function (x) {
        expect(x).to.equal(1);
      },
      null,
      done
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
        .forEach(function (x) {
          expect(x).to.equal(expected.shift());
        }, Promise)
        .then(() => {
          done();
        });

      expect(result.then).to.be.a('function');
    });

    it('should reject promise when in error', (done) => {
      throwError(() => ('bad'))
        .forEach(() => {
          done(new Error('should not be called'));
        }, Promise)
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

    it('should allow Promise to be globally configured', async () => {
      try {
        let wasCalled = false;

        config.Promise = function MyPromise(callback: any) {
          wasCalled = true;
          return new Promise<number>(callback);
        } as any;

        await of(42).forEach((x) => {
          expect(x).to.equal(42);
        })

        expect(wasCalled).to.be.true;
      } finally {
        config.Promise = undefined;
      }
    });

    it('should reject promise if nextHandler throws', (done) => {
      const results: number[] = [];

      of(1, 2, 3)
        .forEach((x) => {
          if (x === 3) {
            throw new Error('NO THREES!');
          }
          results.push(x);
        }, Promise)
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
            // Since the consuming code can no longer interfere with the synchronous
            // producer, the remaining results are nexted.
            expect(results).to.deep.equal([1, 2, 3, 4, expected]);
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

      source.subscribe(
        (x) => {
          nexted = x;
          mutatedByNext = true;
        },
        null,
        () => {
          completed = true;
          mutatedByComplete = true;
        }
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

      empty().subscribe();

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

      empty().subscribe(observer);

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
          function () {
            if (times === 2) {
              subscription.unsubscribe();
            }
          },
          function () {
            errorCalled = true;
          }
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
          function () {
            if (times === 2) {
              subscription.unsubscribe();
            }
          },
          null,
          function () {
            completeCalled = true;
          }
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

          empty().subscribe(o);
        }
      );

      it('should accept an anonymous observer with no functions at all', () => {
        expect(() => {
          empty().subscribe(<any>{});
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
    
    it('should teardown even with a synchronous thrown error', () => {
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
      

    describe('if config.useDeprecatedSynchronousErrorHandling === true', () => {
      beforeEach(() => {
        config.useDeprecatedSynchronousErrorHandling = true;
      });

      it('should throw synchronously', () => {
        expect(() => throwError(() => new Error('thrown error')).subscribe()).to.throw(Error, 'thrown error');
      });

      it('should rethrow if next handler throws', () => {
        const observable = new Observable((observer) => {
          observer.next(1);
        });

        const sink = Subscriber.create(() => {
          throw 'error!';
        });

        expect(() => {
          observable.subscribe(sink);
        }).to.throw('error!');
      });


      // From issue: https://github.com/ReactiveX/rxjs/issues/5979
      it('should still rethrow synchronous errors from next handlers on synchronous observables', () => {
        expect(() => {
          of('test').pipe(
            // Any operators here
            map(x => x + '!!!'),
            map(x => x + x),
            map(x => x + x),
            map(x => x + x),
          ).subscribe({
            next: () => {
              throw new Error(
                'hi there!'
              )
            }
          })
        }).to.throw('hi there!');
      });

      it('should rethrow synchronous errors from flattened observables', () => {
        expect(() => {
          of(1)
            .pipe(concatMap(() => throwError(() => new Error('Ahoy! An error!'))))
            .subscribe(console.log);
        }).to.throw('Ahoy! An error!');

        expect(() => {
          of(1)
            .pipe(switchMap(() => throwError(() => new Error('Avast! Thar be a new error!'))))
            .subscribe(console.log);
        }).to.throw('Avast! Thar be a new error!');
      });

      it('should teardown even with a synchronous error', () => {
        let called = false;
        const badObservable = new Observable((subscriber) => {
          subscriber.add(() => {
            called = true;
          });

          subscriber.error(new Error('bad'));
        });

        try {
          badObservable.subscribe();
        } catch (err) {
          // do nothing
        }
        expect(called).to.be.true;
      });

      it('should teardown even with a synchronous thrown error', () => {
        let called = false;
        const badObservable = new Observable((subscriber) => {
          subscriber.add(() => {
            called = true;
          });

          throw new Error('bad');
        });

        try {
          badObservable.subscribe();
        } catch (err) {
          // do nothing
        }
        expect(called).to.be.true;
      });

      
      it('should handle empty string sync errors', () => {
        const badObservable = new Observable(() => {
          throw '';
        });

        let caught = false;
        try {
          badObservable.subscribe();
        } catch (err) {
          caught = true;
          expect(err).to.equal('');
        }
        expect(caught).to.be.true;
      });

      it('should execute finalize even with a sync error', () => {
        let called = false;
        const badObservable = new Observable((subscriber) => {
          subscriber.error(new Error('bad'));
        }).pipe(
          finalize(() => {
            called = true;
          })
        );

        try {
          badObservable.subscribe();
        } catch (err) {
          // do nothing
        }
        expect(called).to.be.true;
      });
      
      it('should execute finalize even with a sync thrown error', () => {
        let called = false;
        const badObservable = new Observable(() => {
          throw new Error('bad');
        }).pipe(
          finalize(() => {
            called = true;
          })
        );

        try {
          badObservable.subscribe();
        } catch (err) {
          // do nothing
        }
        expect(called).to.be.true;
      });
      
      it('should execute finalize in order even with a sync error', () => {
        const results: any[] = [];
        const badObservable = new Observable((subscriber) => {
          subscriber.error(new Error('bad'));
        }).pipe(
          finalize(() => {
            results.push(1);
          }),
          finalize(() => {
            results.push(2)
          })
        );

        try {
          badObservable.subscribe();
        } catch (err) {
          // do nothing
        }
        expect(results).to.deep.equal([1, 2]);
      });

      it('should execute finalize in order even with a sync thrown error', () => {
        const results: any[] = [];
        const badObservable = new Observable(() => {
          throw new Error('bad');
        }).pipe(
          finalize(() => {
            results.push(1);
          }),
          finalize(() => {
            results.push(2)
          })
        );

        try {
          badObservable.subscribe();
        } catch (err) {
          // do nothing
        }
        expect(results).to.deep.equal([1, 2]);
      });

      // https://github.com/ReactiveX/rxjs/issues/6271      
      it('should not have a run-time error if no errors are thrown and there are operators', () => {
        expect(() => {
          of(1, 2, 3).pipe(
            map(x => x + x),
            map(x => Math.log(x))
          )
          .subscribe();
        }).not.to.throw();
      });

      it('should call teardown if sync unsubscribed', () => {
        let called = false;
        const observable = new Observable(() => () => (called = true));
        const subscription = observable.subscribe();
        subscription.unsubscribe();

        expect(called).to.be.true;
      });

      it('should call registered teardowns if sync unsubscribed', () => {
        let called = false;
        const observable = new Observable((subscriber) => subscriber.add(() => called = true));
        const subscription = observable.subscribe();
        subscription.unsubscribe();

        expect(called).to.be.true;
      });

      afterEach(() => {
        config.useDeprecatedSynchronousErrorHandling = false;
      });
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
          (x) => {
            expect(x).to.equal('testtest!!!');
          },
          null,
          done
        );
    });

    it('should return the same observable if there are no arguments', () => {
      const source = of('test');
      const result = source.pipe();
      expect(result).to.equal(source);
    });
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
  it('should handle sync errors within a test scheduler', () => {
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

/** @test {Observable} */
describe('Observable.create', () => {
  it('should create an Observable', () => {
    const result = Observable.create(() => {
      //noop
    });
    expect(result instanceof Observable).to.be.true;
  });

  it('should provide an observer to the function', () => {
    let called = false;
    const result = Observable.create((observer: Observer<any>) => {
      called = true;
      expectFullObserver(observer);
      observer.complete();
    });

    expect(called).to.be.false;
    result.subscribe(() => {
      //noop
    });
    expect(called).to.be.true;
  });

  it('should send errors thrown in the passed function down the error path', (done) => {
    Observable.create(() => {
      throw new Error('this should be handled');
    }).subscribe({
      error(err: Error) {
        expect(err).to.exist.and.be.instanceof(Error).and.have.property('message', 'this should be handled');
        done();
      },
    });
  });
});

/** @test {Observable} */
describe('Observable.lift', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  class MyCustomObservable<T> extends Observable<T> {
    static from<T>(source: any) {
      const observable = new MyCustomObservable<T>();
      observable.source = <Observable<T>>source;
      return observable;
    }
    lift<R>(operator: Operator<T, R>): Observable<R> {
      const observable = new MyCustomObservable<R>();
      (<any>observable).source = this;
      (<any>observable).operator = operator;
      return observable;
    }
  }

  it('should return Observable which calls TeardownLogic of operator on unsubscription', (done) => {
    const myOperator: Operator<any, any> = {
      call: (subscriber: Subscriber<any>, source: any) => {
        const subscription = source.subscribe((x: any) => subscriber.next(x));
        return () => {
          subscription.unsubscribe();
          done();
        };
      },
    };

    (NEVER as any).lift(myOperator)
      .subscribe()
      .unsubscribe();

  });

  it('should be overrideable in a custom Observable type that composes', (done) => {
    const result = new MyCustomObservable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    }).pipe(
      map((x) => {
        return 10 * x;
      })
    );

    expect(result instanceof MyCustomObservable).to.be.true;

    const expected = [10, 20, 30];

    result.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        done();
      }
    );
  });

  it('should compose through multicast and refCount', (done) => {
    const result = new MyCustomObservable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    }).pipe(
      multicast(() => new Subject<number>()),
      refCount(),
      map((x) => 10 * x)
    );

    expect(result instanceof MyCustomObservable).to.be.true;

    const expected = [10, 20, 30];

    result.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        done();
      }
    );
  });

  
  it('should compose through publish and refCount', (done) => {
    const result = new MyCustomObservable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    }).pipe(
      publish(),
      refCount(),
      map((x) => 10 * x)
    );

    expect(result instanceof MyCustomObservable).to.be.true;

    const expected = [10, 20, 30];

    result.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        done();
      }
    );
  });

  
  it('should compose through publishLast and refCount', (done) => {
    const result = new MyCustomObservable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    }).pipe(
      publishLast(),
      refCount(),
      map((x) => 10 * x)
    );

    expect(result instanceof MyCustomObservable).to.be.true;

    const expected = [30];

    result.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        done();
      }
    );
  });

  it('should compose through publishBehavior and refCount', (done) => {
    const result = new MyCustomObservable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    }).pipe(
      publishBehavior(0),
      refCount(),
      map((x) => 10 * x)
    );

    expect(result instanceof MyCustomObservable).to.be.true;

    const expected = [0, 10, 20, 30];

    result.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        done();
      }
    );
  });

  it('should composes Subjects in the simple case', () => {
    const subject = new Subject<number>();
    
    const result = subject.pipe(
      map((x) => 10 * x)
    ) as any as Subject<number>; // Yes, this is correct. (but you're advised not to do this)

    expect(result instanceof Subject).to.be.true;

    const emitted: any[] = [];
    result.subscribe(value => emitted.push(value));

    result.next(10);
    result.next(20);
    result.next(30);
    
    expect(emitted).to.deep.equal([100, 200, 300]);
  });

  /**
   * Seriously, never do this. It's probably bad that we've allowed this. Fortunately, it's not
   * a common practice, so maybe we can remove it?
   */
  it('should demonstrate the horrors of sharing and lifting the Subject through', () => {
    const subject = new Subject<number>();
    
    const shared = subject.pipe(
      share()
    );

    const result1 = shared.pipe(
      map(x => x * 10)
    ) as any as Subject<number>; // Yes, this is correct.

    const result2 = shared.pipe(
      map(x => x - 10)
    ) as any as Subject<number>; // Yes, this is correct.
    expect(result1 instanceof Subject).to.be.true;

    const emitted1: any[] = [];
    result1.subscribe(value => emitted1.push(value));
    
    const emitted2: any[] = [];
    result2.subscribe(value => emitted2.push(value));

    // THIS IS HORRIBLE DON'T DO THIS.
    result1.next(10);
    result2.next(20); // Yuck
    result1.next(30); 
    
    expect(emitted1).to.deep.equal([100, 200, 300]);
    expect(emitted2).to.deep.equal([0, 10, 20]);
  });

  /**
   * This section outlines one of the reasons that we need to get rid of operators that return
   * Connectable observable. Likewise it also reveals a slight design flaw in `lift`. It
   * probably should have never tried to compose through the Subject's observer methods.
   * If you're a user and you're reading this... NEVER try to use this feature, it's likely
   * to go away at some point.
   * 
   * The problem is that you can have the Subject parts, or you can have the ConnectableObservable parts,
   * but you can't have both.
   * 
   * NOTE: We can remove this in version 8 or 9, because we're getting rid of operators that
   * return `ConnectableObservable`. :tada:
   */
  describe.skip('The lift through Connectable gaff', () => {
    it('should compose through multicast and refCount, even if it is a Subject', () => {
      const subject = new Subject<number>();
      
      const result = subject.pipe(
        multicast(() => new Subject<number>()),
        refCount(),
        map((x) => 10 * x)
      ) as any as Subject<number>; // Yes, this is correct.

      expect(result instanceof Subject).to.be.true;

      const emitted: any[] = [];
      result.subscribe(value => emitted.push(value));

      result.next(10);
      result.next(20);
      result.next(30);
      
      expect(emitted).to.deep.equal([100, 200, 300]);
    });
    
    it('should compose through publish and refCount, even if it is a Subject', () => {
      const subject = new Subject<number>();
      
      const result = subject.pipe(
        publish(),
        refCount(),
        map((x) => 10 * x)
      ) as any as Subject<number>; // Yes, this is correct.

      expect(result instanceof Subject).to.be.true;

      const emitted: any[] = [];
      result.subscribe(value => emitted.push(value));

      result.next(10);
      result.next(20);
      result.next(30);
      
      expect(emitted).to.deep.equal([100, 200, 300]);
    });

    
    it('should compose through publishLast and refCount, even if it is a Subject', () => {
      const subject = new Subject<number>();
      
      const result = subject.pipe(
        publishLast(),
        refCount(),
        map((x) => 10 * x)
      ) as any as Subject<number>; // Yes, this is correct.

      expect(result instanceof Subject).to.be.true;

      const emitted: any[] = [];
      result.subscribe(value => emitted.push(value));

      result.next(10);
      result.next(20);
      result.next(30);
      
      expect(emitted).to.deep.equal([100, 200, 300]);
    });

    it('should compose through publishBehavior and refCount, even if it is a Subject', () => {
      const subject = new Subject<number>();
      
      const result = subject.pipe(
        publishBehavior(0),
        refCount(),
        map((x) => 10 * x)
      ) as any as Subject<number>; // Yes, this is correct.

      expect(result instanceof Subject).to.be.true;

      const emitted: any[] = [];
      result.subscribe(value => emitted.push(value));

      result.next(10);
      result.next(20);
      result.next(30);
      
      expect(emitted).to.deep.equal([0, 100, 200, 300]);
    });
  });

  it('should compose through multicast with selector function', (done) => {
    const result = new MyCustomObservable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    }).pipe(
      multicast(
        () => new Subject<number>(),
        (shared) => shared.pipe(map((x) => 10 * x))
      )
    );

    expect(result instanceof MyCustomObservable).to.be.true;

    const expected = [10, 20, 30];

    result.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        done();
      }
    );
  });

  it('should compose through combineLatest', () => {
    rxTestScheduler.run(({ cold, expectObservable }) => {
      const e1 = cold(' -a--b-----c-d-e-|');
      const e2 = cold(' --1--2-3-4---|   ');
      const expected = '--A-BC-D-EF-G-H-|';

      const result = MyCustomObservable.from(e1).pipe(combineLatest(e2, (a, b) => String(a) + String(b)));

      expect(result instanceof MyCustomObservable).to.be.true;

      expectObservable(result).toBe(expected, {
        A: 'a1',
        B: 'b1',
        C: 'b2',
        D: 'b3',
        E: 'b4',
        F: 'c4',
        G: 'd4',
        H: 'e4',
      });
    });
  });

  it('should compose through concat', () => {
    rxTestScheduler.run(({ cold, expectObservable }) => {
      const e1 = cold(' --a--b-|');
      const e2 = cold(' --x---y--|');
      const expected = '--a--b---x---y--|';

      const result = MyCustomObservable.from(e1).pipe(concat(e2, rxTestScheduler));

      expect(result instanceof MyCustomObservable).to.be.true;

      expectObservable(result).toBe(expected);
    });
  });
  it('should compose through merge', () => {
    rxTestScheduler.run(({ cold, expectObservable }) => {
      const e1 = cold(' -a--b-| ');
      const e2 = cold(' --x--y-|');
      const expected = '-ax-by-|';

      const result = MyCustomObservable.from(e1).pipe(merge(e2, rxTestScheduler));

      expect(result instanceof MyCustomObservable).to.be.true;

      expectObservable(result).toBe(expected);
    });
  });

  it('should compose through race', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----b-----c----|');
      const e1subs = '  ^-------------------!';
      const e2 = cold(' ------x-----y-----z----|');
      const e2subs = '  ^--!';
      const expected = '---a-----b-----c----|';

      const result = MyCustomObservable.from<string>(e1).pipe(
        race(e2)
      );

      expect(result instanceof MyCustomObservable).to.be.true;

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should compose through zip', () => {
    rxTestScheduler.run(({ cold, expectObservable }) => {
      const e1 = cold(' -a--b-----c-d-e-|');
      const e2 = cold(' --1--2-3-4---|   ');
      const expected = '--A--B----C-D|   ';

      const result = MyCustomObservable.from(e1).pipe(zip(e2, (a, b) => String(a) + String(b)));

      expect(result instanceof MyCustomObservable).to.be.true;

      expectObservable(result).toBe(expected, {
        A: 'a1',
        B: 'b2',
        C: 'c3',
        D: 'd4',
      });
    });
  });

  it('should allow injecting behaviors into all subscribers in an operator ' + 'chain when overridden', (done) => {
    // The custom Subscriber
    const log: Array<string> = [];

    class LogSubscriber<T> extends Subscriber<T> {
      next(value?: T): void {
        log.push('next ' + value);
        if (!this.isStopped) {
          this._next(value!);
        }
      }
    }

    // The custom Operator
    class LogOperator<T, R> implements Operator<T, R> {
      constructor(private childOperator: Operator<T, R>) {}

      call(subscriber: Subscriber<R>, source: any): TeardownLogic {
        return this.childOperator.call(new LogSubscriber<R>(subscriber), source);
      }
    }

    // The custom Observable
    class LogObservable<T> extends Observable<T> {
      lift<R>(operator: Operator<T, R>): Observable<R> {
        const observable = new LogObservable<R>();
        observable.source = this;
        observable.operator = new LogOperator(operator);
        return observable;
      }
    }

    // Use the LogObservable
    const result = new LogObservable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    }).pipe(
      map((x) => 10 * x),
      filter((x) => x > 15),
      count()
    );

    expect(result instanceof LogObservable).to.be.true;

    const expected = [2];

    result.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        expect(log).to.deep.equal([
          'next 10', // map
          'next 20', // map
          'next 20', // filter
          'next 30', // map
          'next 30', // filter
          'next 2', // count
        ]);
        done();
      }
    );
  });
});
