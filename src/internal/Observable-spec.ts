import { expect } from 'chai';
import { Observable, of, throwError, EMPTY, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';
import * as sinon from 'sinon';
import { Subject } from './Subject';

function expectFullObserver(val: any) {
  expect(val).to.be.a('object');
  expect(val.next).to.be.a('function');
  expect(val.error).to.be.a('function');
  expect(val.complete).to.be.a('function');
  expect(val.closed).to.be.a('boolean');
}

/** @test {Observable} */
describe.only('Observable', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  it('should be constructed with a subscriber function', (done) => {
    const source = new Observable<number>(subscriber => {
      expectFullObserver(subscriber);
      subscriber.next(1);
      subscriber.complete();
    });

    source.subscribe({
      next: x => expect(x).to.equal(1),
      complete: done
    });
  });

  it('should send errors thrown in the constructor down the error path', (done) => {
    new Observable(() => {
      throw new Error('this should be handled');
    })
    .subscribe({
      error(err) {
        expect(err).to.exist
          .and.be.instanceof(Error)
          .and.have.property('message', 'this should be handled');
        done();
      }
    });
  });

  it('should allow empty ctor, which is effectively a never-observable', () => {
    testScheduler.run(({ expectObservable }) => {
      const result = new Observable();
      expectObservable(result).toBe('-');
    });
  });

  describe.skip('forEach', () => {
    it('should iterate and return a Promise', (done) => {
      const expected = [1, 2, 3];
      const result = of(1, 2, 3).forEach(function (x) {
        expect(x).to.equal(expected.shift());
      })
      .then(() => {
        done();
      });

      expect(result.then).to.be.a('function');
    });

    it('should reject promise when in error', () => {
      return throwError('bad').forEach(() => {
        throw new Error('should not be called');
      }).then(() => {
        throw new Error('should not complete');
      }, (err: any) => {
        expect(err).to.equal('bad');
      });
    });

    it('should reject promise if nextHandler throws', (done) => {
      const results: number[] = [];

      of(1, 2, 3).forEach((x) => {
        if (x === 3) {
          throw new Error('NO THREES!');
        }
        results.push(x);
      })
      .then(() => {
        done(new Error('should not be called'));
      }, (err) => {
        expect(err).to.be.an('error', 'NO THREES!');
        expect(results).to.deep.equal([1, 2]);
        done();
      });
    });

    it('should handle a synchronous throw from the next handler', () => {
      const expected = 'I told, you Bobby Boucher, threes are the debil!';
      const syncObservable = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.next(4);
      });

      const results: Array<number | Error> = [];

      return syncObservable.forEach((x) => {
        results.push(x);
        if (x === 3) {
          throw expected;
        }
      }).then(
        () => {
         throw new Error('should not be called');
        },
        (err) => {
          results.push(err);
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

      return asyncObservable.forEach((x) => {
        results.push(x);
        if (x === 2) {
          throw expected;
        }
      }).then(
        () => {
          throw new Error('should not be called');
        },
        (err) => {
          results.push(err);
          expect(results).to.deep.equal([1, 2, expected]);
        }
      );
    });

    it('should be cancellable via passed Subscription', () => {
      const source = of(1, 2, 3, 4);
      const results: any[] = [];
      const subs = new Subscription();
      return source.forEach(x => {
        results.push(x);
        if (x === 3) {
          subs.unsubscribe();
        }
      }, subs)
      .then(
        () => {
          throw new Error('should not complete');
        },
        err => {
          expect(results).to.deep.equal([1, 2, 3]);
          expect(err).to.exist
            .and.be.instanceof(Error)
            .and.have.property('message', 'forEach aborted');
        }
      );
    });

    it('should be cancelled if the Subscription is already unsubscribed', () => {
      const source = of(1, 2, 3, 4);
      const results: any[] = [];
      const subs = new Subscription();
      subs.unsubscribe();

      return source.forEach(x => {
        results.push(x);
        if (x === 3) {
          subs.unsubscribe();
        }
      }, subs)
      .then(
        () => {
          throw new Error('should not complete');
        },
        err => {
          expect(results).to.deep.equal([]);
          expect(err).to.exist
            .and.be.instanceof(Error)
            .and.have.property('message', 'forEach aborted');
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
        }
      });

      expect(mutatedByNext).to.be.true;
      expect(mutatedByComplete).to.be.true;
    });

    it('should work if subscribe is called with a Subject', () => {
      const subject = new Subject();
      const results: any[] = [];

      subject.subscribe({
        next(value) { results.push(value); },
        complete() { results.push('done'); },
      });

      const source = new Observable<string>((subscriber) => {
        subscriber.next('foo');
        subscriber.complete();
      });

      source.subscribe(subject);

      expect(results).to.deep.equal(['foo', 'done']);
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
        next: function () { /*noop*/ }
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
      const source = new Observable<number>(observer => {
        const id = setInterval(() => {
          observer.error(0);
        }, 1);
        return () => {
          clearInterval(id);
          unsubscribeCalled = true;
        };
      });

      source.subscribe();

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

    it.only('should ignore next messages after unsubscription', (done) => {
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
        .pipe(tap(() => times += 1))
        .subscribe(
          function () {
            if (times === 2) {
              subscription.unsubscribe();
            }
          }
        );

    });

    it('should ignore error messages after unsubscription', (done) => {
      let times = 0;
      let errorCalled = false;

      const subscription = new Observable<number>(subscriber => {
        let i = 0;
        const id = setInterval(() => {
          subscriber.next(i++);
          if (i === 3) {
            subscriber.error(new Error());
          }
        });

        return () => {
          clearInterval(id);
          expect(times).to.equal(2);
          expect(errorCalled).to.be.false;
          done();
        };
      })
        .pipe(tap(() => times += 1))
        .subscribe({
          next () {
            if (times === 2) {
              subscription.unsubscribe();
            }
          },
          error () { errorCalled = true; }
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
        .pipe(tap(() => times += 1))
        .subscribe({
          next() {
            if (times === 2) {
              subscription.unsubscribe();
            }
          },
          complete() { completeCalled = true; }
        });
    });

    describe('when called with an anonymous observer', () => {
      it('should accept an anonymous observer with just a next function and call the next function in the context' +
        ' of the anonymous observer', (done) => {
          //intentionally not using lambda to avoid typescript's this context capture
          const o = {
            myValue: 'foo',
            next(x: any) {
              expect(this.myValue).to.equal('foo');
              expect(x).to.equal(1);
              done();
            }
          };

          of(1).subscribe(o);
        });

      it('should accept an anonymous observer with just an error function and call the error function in the context' +
        ' of the anonymous observer', (done) => {
          //intentionally not using lambda to avoid typescript's this context capture
          const o = {
            myValue: 'foo',
            error(err: any) {
              expect(this.myValue).to.equal('foo');
              expect(err).to.equal('bad');
              done();
            }
          };

          throwError('bad').subscribe(o);
        });

      it('should accept an anonymous observer with just a complete function and call the complete function in the' +
        ' context of the anonymous observer', (done) => {
          //intentionally not using lambda to avoid typescript's this context capture
          const o = {
            myValue: 'foo',
            complete: function complete() {
              expect(this.myValue).to.equal('foo');
              done();
            }
          };

          EMPTY.subscribe(o);
        });

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
          .pipe(tap(() => times += 1))
          .subscribe({
            next() {
              if (times === 2) {
                subscription.unsubscribe();
              }
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
          .pipe(tap(() => times += 1))
          .subscribe({
            next() {
              if (times === 2) {
                subscription.unsubscribe();
              }
            },
            error() { errorCalled = true; }
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
          .pipe(tap(() => times += 1))
          .subscribe({
            next() {
              if (times === 2) {
                subscription.unsubscribe();
              }
            },
            complete() { completeCalled = true; }
          });

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
          map((x: string) => x + x),
          map((x) => x + '!!!')
        )
        .subscribe({
          next: x => {
            expect(x).to.equal('testtest!!!');
          },
          complete: done
        });
    });

    it('should return the same observable if there are no arguments', () => {
      const source = of('test');
      const result = source.pipe();
      expect(result).to.equal(source);
    });
  });

  // TODO(benlesh): talk to @cartant about this one.

  // it.only('should not swallow internal errors', () => {
  //   const consoleStub = sinon.stub(console, 'warn');
  //   try {
  //     let source = new Observable<number>(observer => observer.next(42));
  //     for (let i = 0; i < 10000; ++i) {
  //       let base = source;
  //       source = new Observable<number>(observer => base.subscribe(observer));
  //     }
  //     source.subscribe();
  //     expect(consoleStub).to.have.property('called', true);
  //   } finally {
  //     consoleStub.restore();
  //   }
  // });
});
