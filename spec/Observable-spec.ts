import { expect } from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../dist/package/Rx';
import { TeardownLogic } from '../dist/package/Subscription';
import marbleTestingSignature = require('./helpers/marble-testing'); // tslint:disable-line:no-require-imports
import { map } from '../dist/package/operators/map';

declare const { asDiagram, rxTestScheduler };
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Subscriber = Rx.Subscriber;
const Observable = Rx.Observable;

declare const __root__: any;

function expectFullObserver(val) {
  expect(val).to.be.a('object');
  expect(val.next).to.be.a('function');
  expect(val.error).to.be.a('function');
  expect(val.complete).to.be.a('function');
  expect(val.closed).to.be.a('boolean');
}

/** @test {Observable} */
describe('Observable', () => {
  it('should be constructed with a subscriber function', (done: MochaDone) => {
    const source = new Observable(function (observer) {
      expectFullObserver(observer);
      observer.next(1);
      observer.complete();
    });

    source.subscribe(function (x) { expect(x).to.equal(1); }, null, done);
  });

  it('should send errors thrown in the constructor down the error path', (done) => {
    new Observable((observer) => {
      throw new Error('this should be handled');
    })
    .subscribe({
      error(err) {
        expect(err).to.deep.equal(new Error('this should be handled'));
        done();
      }
    });
  });

  it('should not send error to error handler for observable have source', () => {
    const source = Observable.of(1);
    const observable = new Observable();
    (observable as any).source = source;

    expect(() => {
      observable.subscribe((x) => {
        throw new Error('error');
      });
    }).to.throw();
  });

  it('should rethrow if sink has syncErrorThrowable = false', () => {
    const observable = new Observable(observer => {
      observer.next(1);
    });

    const sink = Subscriber.create(() => {
      throw 'error!';
    });

    expect(() => {
      observable.subscribe(sink);
    }).to.throw('error!');
  });

  describe('forEach', () => {
    it('should iterate and return a Promise', (done: MochaDone) => {
      const expected = [1, 2, 3];
      const result = Observable.of(1, 2, 3).forEach(function (x) {
        expect(x).to.equal(expected.shift());
      }, Promise)
      .then(() => {
        done();
      });

      expect(result.then).to.be.a('function');
    });

    it('should reject promise when in error', (done: MochaDone) => {
      Observable.throw('bad').forEach((x: any) => {
        done(new Error('should not be called'));
      }, Promise).then(() => {
        done(new Error('should not complete'));
      }, (err: any) => {
        expect(err).to.equal('bad');
        done();
      });
    });

    it('should allow Promise to be globally configured', (done: MochaDone) => {
      let wasCalled = false;

      __root__.Rx = {};
      __root__.Rx.config = {};
      __root__.Rx.config.Promise = function MyPromise(callback) {
        wasCalled = true;
        return new Promise(callback);
      };

      Observable.of(42).forEach((x: number) => {
        expect(x).to.equal(42);
      }).then(() => {
        expect(wasCalled).to.be.true;
        delete __root__.Rx;
        done();
      });
    });

    it('should reject promise if nextHandler throws', (done: MochaDone) => {
      const results = [];

      Observable.of(1, 2, 3).forEach((x: number) => {
        if (x === 3) {
          throw new Error('NO THREES!');
        }
        results.push(x);
      }, Promise)
      .then(() => {
        done(new Error('should not be called'));
      }, (err) => {
        expect(err).to.be.an('error', 'NO THREES!');
        expect(results).to.deep.equal([1, 2]);
      }).then(() => {
        done();
      });
    });

    it('should handle a synchronous throw from the next handler and tear down', (done: MochaDone) => {
      const expected = new Error('I told, you Bobby Boucher, twos are the debil!');
      let unsubscribeCalled = false;
      const syncObservable = new Observable<number>((observer: Rx.Observer<number>) => {
        observer.next(1);
        observer.next(2);
        observer.next(3);

        return () => {
          unsubscribeCalled = true;
        };
      });

      const results = [];
      syncObservable.forEach((x) => {
        results.push(x);
        if (x === 2) {
          throw expected;
        }
      }).then(
        () => {
          done(new Error('should not be called'));
        },
        (err) => {
          results.push(err);
          expect(results).to.deep.equal([1, 2, expected]);
          expect(unsubscribeCalled).to.be.true;
          done();
        });
    });

    it('should handle an asynchronous throw from the next handler and tear down', (done: MochaDone) => {
      const expected = new Error('I told, you Bobby Boucher, twos are the debil!');
      let unsubscribeCalled = false;
      const syncObservable = new Observable<number>((observer: Rx.Observer<number>) => {
        let i = 1;
        const id = setInterval(() => observer.next(i++), 1);

        return () => {
          clearInterval(id);
          unsubscribeCalled = true;
        };
      });

      const results = [];
      syncObservable.forEach((x) => {
        results.push(x);
        if (x === 2) {
          throw expected;
        }
      }).then(
        () => {
          done(new Error('should not be called'));
        },
        (err) => {
          results.push(err);
          expect(results).to.deep.equal([1, 2, expected]);
          expect(unsubscribeCalled).to.be.true;
          done();
        });
    });
  });

  describe('subscribe', () => {
    it('should be synchronous', () => {
      let subscribed = false;
      let nexted;
      let completed;
      const source = new Observable((observer: Rx.Observer<string>) => {
        subscribed = true;
        observer.next('wee');
        expect(nexted).to.equal('wee');
        observer.complete();
        expect(completed).to.be.true;
      });

      expect(subscribed).to.be.false;

      let mutatedByNext = false;
      let mutatedByComplete = false;

      source.subscribe((x: string) => {
        nexted = x;
        mutatedByNext = true;
      }, null, () => {
        completed = true;
        mutatedByComplete = true;
      });

      expect(mutatedByNext).to.be.true;
      expect(mutatedByComplete).to.be.true;
    });

    it('should work when subscribe is called with no arguments', () => {
      const source = new Observable((subscriber: Rx.Subscriber<string>) => {
        subscriber.next('foo');
        subscriber.complete();
      });

      source.subscribe();
    });

    it('should not be unsubscribed when other empty subscription completes', () => {
      let unsubscribeCalled = false;
      const source = new Observable(() => {
        return () => {
          unsubscribeCalled = true;
        };
      });

      source.subscribe();

      expect(unsubscribeCalled).to.be.false;

      Observable.empty().subscribe();

      expect(unsubscribeCalled).to.be.false;
    });

    it('should not be unsubscribed when other subscription with same observer completes', () => {
      let unsubscribeCalled = false;
      const source = new Observable(() => {
        return () => {
          unsubscribeCalled = true;
        };
      });

      let observer = {
        next: function () { /*noop*/ }
      };

      source.subscribe(observer);

      expect(unsubscribeCalled).to.be.false;

      Observable.empty().subscribe(observer);

      expect(unsubscribeCalled).to.be.false;
    });

    it('should run unsubscription logic when an error is sent synchronously and subscribe is called with no arguments', () => {
      let unsubscribeCalled = false;
      const source = new Observable((subscriber: Rx.Subscriber<string>) => {
        subscriber.error(0);
        return () => {
          unsubscribeCalled = true;
        };
      });

      try {
        source.subscribe();
      } catch (e) {
        // error'ing to an empty Observer re-throws, so catch and ignore it here.
      }

      expect(unsubscribeCalled).to.be.true;
    });

    it('should run unsubscription logic when an error is sent asynchronously and subscribe is called with no arguments', (done: MochaDone) => {
      const sandbox = sinon.sandbox.create();
      const fakeTimer = sandbox.useFakeTimers();

      let unsubscribeCalled = false;
      const source = new Observable((subscriber: Rx.Subscriber<string>) => {
        const id = setInterval(() => {
          try {
            subscriber.error(0);
          } catch (e) {
            // asynchronously error'ing to an empty Observer re-throws, so catch and ignore it here.
          }
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

      const source = new Observable(() => {
        return () => {
          unsubscribeCalled = true;
        };
      });

      const sub = source.subscribe(() => {
        //noop
       });
      expect(sub instanceof Rx.Subscription).to.be.true;
      expect(unsubscribeCalled).to.be.false;
      expect(sub.unsubscribe).to.be.a('function');

      sub.unsubscribe();
      expect(unsubscribeCalled).to.be.true;
    });

    it('should run unsubscription logic when an error is thrown sending messages synchronously', () => {
      let messageError = false;
      let messageErrorValue = false;
      let unsubscribeCalled = false;

      let sub;
      const source = new Observable((observer: Rx.Observer<string>) => {
        observer.next('boo!');
        return () => {
          unsubscribeCalled = true;
        };
      });

      try {
        sub = source.subscribe((x: string) => { throw x; });
      } catch (e) {
        messageError = true;
        messageErrorValue = e;
      }

      expect(sub).to.be.a('undefined');
      expect(unsubscribeCalled).to.be.true;
      expect(messageError).to.be.true;
      expect(messageErrorValue).to.equal('boo!');
    });

    it('should dispose of the subscriber when an error is thrown sending messages synchronously', () => {
      let messageError = false;
      let messageErrorValue = false;
      let unsubscribeCalled = false;

      let sub;
      const subscriber = new Subscriber((x: string) => { throw x; });
      const source = new Observable((observer: Rx.Observer<string>) => {
        observer.next('boo!');
        return () => {
          unsubscribeCalled = true;
        };
      });

      try {
        sub = source.subscribe(subscriber);
      } catch (e) {
        messageError = true;
        messageErrorValue = e;
      }

      expect(sub).to.be.a('undefined');
      expect(subscriber.closed).to.be.true;
      expect(unsubscribeCalled).to.be.true;
      expect(messageError).to.be.true;
      expect(messageErrorValue).to.equal('boo!');
    });

    it('should ignore next messages after unsubscription', () => {
      let times = 0;

      new Observable((observer: Rx.Observer<number>) => {
        observer.next(0);
        observer.next(0);
        observer.next(0);
        observer.next(0);
      })
      .do(() => times += 1)
      .subscribe(
        function() {
          if (times === 2) {
            this.unsubscribe();
          }
        }
      );

      expect(times).to.equal(2);
    });

    it('should ignore error messages after unsubscription', () => {
      let times = 0;
      let errorCalled = false;

      new Observable((observer: Rx.Observer<number>) => {
        observer.next(0);
        observer.next(0);
        observer.next(0);
        observer.error(0);
      })
      .do(() => times += 1)
      .subscribe(
        function() {
          if (times === 2) {
            this.unsubscribe();
          }
        },
        function() { errorCalled = true; }
      );

      expect(times).to.equal(2);
      expect(errorCalled).to.be.false;
    });

    it('should ignore complete messages after unsubscription', () => {
      let times = 0;
      let completeCalled = false;

      new Observable((observer: Rx.Observer<number>) => {
        observer.next(0);
        observer.next(0);
        observer.next(0);
        observer.complete();
      })
      .do(() => times += 1)
      .subscribe(
        function() {
          if (times === 2) {
            this.unsubscribe();
          }
        },
        null,
        function() { completeCalled = true; }
      );

      expect(times).to.equal(2);
      expect(completeCalled).to.be.false;
    });

    describe('when called with an anonymous observer', () => {
      it('should accept an anonymous observer with just a next function and call the next function in the context' +
        ' of the anonymous observer', (done: MochaDone) => {
        //intentionally not using lambda to avoid typescript's this context capture
        const o = {
          myValue: 'foo',
          next: function next(x) {
            expect(this.myValue).to.equal('foo');
            expect(x).to.equal(1);
            done();
          }
        };

        Observable.of(1).subscribe(o);
      });

      it('should accept an anonymous observer with just an error function and call the error function in the context' +
        ' of the anonymous observer', (done: MochaDone) => {
        //intentionally not using lambda to avoid typescript's this context capture
        const o = {
          myValue: 'foo',
          error: function error(err) {
            expect(this.myValue).to.equal('foo');
            expect(err).to.equal('bad');
            done();
          }
        };

        Observable.throw('bad').subscribe(o);
      });

      it('should accept an anonymous observer with just a complete function and call the complete function in the' +
        ' context of the anonymous observer', (done: MochaDone) => {
        //intentionally not using lambda to avoid typescript's this context capture
         const o = {
          myValue: 'foo',
          complete: function complete() {
            expect(this.myValue).to.equal('foo');
            done();
          }
        };

        Observable.empty().subscribe(o);
      });

      it('should accept an anonymous observer with no functions at all', () => {
        expect(() => {
          Observable.empty().subscribe(<any>{});
        }).not.to.throw();
      });

      it('should run unsubscription logic when an error is thrown sending messages synchronously to an' +
        ' anonymous observer', () => {
        let messageError = false;
        let messageErrorValue = false;
        let unsubscribeCalled = false;

        //intentionally not using lambda to avoid typescript's this context capture
        const o = {
          myValue: 'foo',
          next: function next(x) {
            expect(this.myValue).to.equal('foo');
            throw x;
          }
        };

        let sub;
        const source = new Observable((observer: Rx.Observer<string>) => {
          observer.next('boo!');
          return () => {
            unsubscribeCalled = true;
          };
        });

        try {
          sub = source.subscribe(o);
        } catch (e) {
          messageError = true;
          messageErrorValue = e;
        }

        expect(sub).to.be.a('undefined');
        expect(unsubscribeCalled).to.be.true;
        expect(messageError).to.be.true;
        expect(messageErrorValue).to.equal('boo!');
      });

      it('should ignore next messages after unsubscription', () => {
        let times = 0;

        new Observable((observer: Rx.Observer<number>) => {
          observer.next(0);
          observer.next(0);
          observer.next(0);
          observer.next(0);
        })
        .do(() => times += 1)
        .subscribe({
          next() {
            if (times === 2) {
              this.unsubscribe();
            }
          }
        });

        expect(times).to.equal(2);
      });

      it('should ignore error messages after unsubscription', () => {
        let times = 0;
        let errorCalled = false;

        new Observable((observer: Rx.Observer<number>) => {
          observer.next(0);
          observer.next(0);
          observer.next(0);
          observer.error(0);
        })
        .do(() => times += 1)
        .subscribe({
          next() {
            if (times === 2) {
              this.unsubscribe();
            }
          },
          error() { errorCalled = true; }
        });

        expect(times).to.equal(2);
        expect(errorCalled).to.be.false;
      });

      it('should ignore complete messages after unsubscription', () => {
        let times = 0;
        let completeCalled = false;

        new Observable((observer: Rx.Observer<number>) => {
          observer.next(0);
          observer.next(0);
          observer.next(0);
          observer.complete();
        })
        .do(() => times += 1)
        .subscribe({
          next() {
            if (times === 2) {
              this.unsubscribe();
            }
          },
          complete() { completeCalled = true; }
        });

        expect(times).to.equal(2);
        expect(completeCalled).to.be.false;
      });
    });
  });

  describe('pipe', () => {
    it('should exist', () => {
      const source = Observable.of('test');
      expect(source.pipe).to.be.a('function');
    });

    it('should pipe multiple operations', (done) => {
      Observable.of('test')
        .pipe(
          map((x: string) => x + x),
          map((x: string) => x + '!!!')
        )
        .subscribe(
          x => {
            expect(x).to.equal('testtest!!!');
          },
          null,
          done
        );
    });

    it('should return the same observable if there are no arguments', () => {
      const source = Observable.of('test');
      const result = source.pipe();
      expect(result).to.equal(source);
    });
  });
});

/** @test {Observable} */
describe('Observable.create', () => {
  asDiagram('create(obs => { obs.next(1); })')
  ('should create a cold observable that emits just 1', () => {
    const e1 = Observable.create(obs => { obs.next(1); });
    const expected = 'x';
    expectObservable(e1).toBe(expected, {x: 1});
  });

  it('should create an Observable', () => {
    const result = Observable.create(() => {
      //noop
     });
    expect(result instanceof Observable).to.be.true;
  });

  it('should provide an observer to the function', () => {
    let called = false;
    const result = Observable.create((observer: Rx.Observer<any>) => {
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
    Observable.create((observer) => {
      throw new Error('this should be handled');
    })
    .subscribe({
      error(err) {
        expect(err).to.deep.equal(new Error('this should be handled'));
        done();
      }
    });
  });
});

/** @test {Observable} */
describe('Observable.lift', () => {

  class MyCustomObservable<T> extends Rx.Observable<T> {
    static from<T>(source: any) {
      const observable = new MyCustomObservable<T>();
      observable.source = <Rx.Observable<T>> source;
      return observable;
    }
    lift<R>(operator: Rx.Operator<T, R>): Rx.Observable<R> {
      const observable = new MyCustomObservable<R>();
      (<any>observable).source = this;
      (<any>observable).operator = operator;
      return observable;
    }
  }

  it('should be overrideable in a custom Observable type that composes', (done: MochaDone) => {
    const result = new MyCustomObservable((observer: Rx.Observer<number>) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    }).map((x: number) => { return 10 * x; });

    expect(result instanceof MyCustomObservable).to.be.true;

    const expected = [10, 20, 30];

    result.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should compose through multicast and refCount', (done: MochaDone) => {
    const result = new MyCustomObservable((observer: Rx.Observer<number>) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    })
    .multicast(() => new Rx.Subject())
    .refCount()
    .map((x: number) => { return 10 * x; });

    expect(result instanceof MyCustomObservable).to.be.true;

    const expected = [10, 20, 30];

    result.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should compose through multicast with selector function', (done: MochaDone) => {
    const result = new MyCustomObservable((observer: Rx.Observer<number>) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    })
    .multicast(() => new Rx.Subject(), (shared) => shared.map((x: number) => { return 10 * x; }));

    expect(result instanceof MyCustomObservable).to.be.true;

    const expected = [10, 20, 30];

    result.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should compose through combineLatest', () => {
    const e1 =   cold('-a--b-----c-d-e-|');
    const e2 =   cold('--1--2-3-4---|   ');
    const expected = '--A-BC-D-EF-G-H-|';

    const result = MyCustomObservable.from(e1).combineLatest(e2, (a: any, b: any) => String(a) + String(b));

    expect(result instanceof MyCustomObservable).to.be.true;

    expectObservable(result).toBe(expected, {
      A: 'a1', B: 'b1', C: 'b2', D: 'b3', E: 'b4', F: 'c4', G: 'd4', H: 'e4'
    });
  });

  it('should compose through concat', () => {
    const e1 =   cold('--a--b-|');
    const e2 =   cold(       '--x---y--|');
    const expected =  '--a--b---x---y--|';

    const result = MyCustomObservable.from(e1).concat(e2, rxTestScheduler);

    expect(result instanceof MyCustomObservable).to.be.true;

    expectObservable(result).toBe(expected);
  });

  it('should compose through merge', () => {
    const e1 =   cold('-a--b-| ');
    const e2 =   cold('--x--y-|');
    const expected =  '-ax-by-|';

    const result = MyCustomObservable.from(e1).merge(e2, rxTestScheduler);

    expect(result instanceof MyCustomObservable).to.be.true;

    expectObservable(result).toBe(expected);
  });

  it('should compose through race', () => {
    const e1 =  cold('---a-----b-----c----|');
    const e1subs =   '^                   !';
    const e2 =  cold('------x-----y-----z----|');
    const e2subs =   '^  !';
    const expected = '---a-----b-----c----|';

    const result = MyCustomObservable.from(e1).race(e2);

    expect(result instanceof MyCustomObservable).to.be.true;

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should compose through zip', () => {
    const e1 =   cold('-a--b-----c-d-e-|');
    const e2 =   cold('--1--2-3-4---|   ');
    const expected = ('--A--B----C-D|   ');

    const result = MyCustomObservable.from(e1).zip(e2, (a: any, b: any) => String(a) + String(b));

    expect(result instanceof MyCustomObservable).to.be.true;

    expectObservable(result).toBe(expected, {
      A: 'a1', B: 'b2', C: 'c3', D: 'd4'
    });
  });

  it('should allow injecting behaviors into all subscribers in an operator ' +
  'chain when overridden', (done: MochaDone) => {
    // The custom Subscriber
    const log: Array<string> = [];

    class LogSubscriber<T> extends Rx.Subscriber<T> {
      next(value?: T): void {
        log.push('next ' + value);
        if (!this.isStopped) {
          this._next(value);
        }
      }
    }

    // The custom Operator
    class LogOperator<T, R> implements Rx.Operator<T, R> {
      constructor(private childOperator: Rx.Operator<T, R>) {
      }

      call(subscriber: Rx.Subscriber<R>, source: any): TeardownLogic {
        return this.childOperator.call(new LogSubscriber<R>(subscriber), source);
      }
    }

    // The custom Observable
    class LogObservable<T> extends Observable<T> {
      lift<R>(operator: Rx.Operator<T, R>): Rx.Observable<R> {
        const observable = new LogObservable<R>();
        (<any>observable).source = this;
        (<any>observable).operator = new LogOperator(operator);
        return observable;
      }
    }

    // Use the LogObservable
    const result = new LogObservable((observer: Rx.Observer<number>) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    })
    .map((x: number) => { return 10 * x; })
    .filter((x: number) => { return x > 15; })
    .count();

    expect(result instanceof LogObservable).to.be.true;

    const expected = [2];

    result.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      },
      (x) => {
        done(new Error('should not be called'));
      }, () => {
        expect(log).to.deep.equal([
          'next 10', // map
          'next 20', // map
          'next 20', // filter
          'next 30', // map
          'next 30', // filter
          'next 2' // count
        ]);
        done();
      });
  });
});
