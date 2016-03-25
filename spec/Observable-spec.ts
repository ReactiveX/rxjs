import {expect} from 'chai';
import * as Rx from '../dist/cjs/Rx';

declare const {asDiagram, expectObservable};
const Subscriber = Rx.Subscriber;
const Observable = Rx.Observable;

declare const __root__: any;

function expectFullObserver(val) {
  expect(val).to.be.a('object');
  expect(val.next).to.be.a('function');
  expect(val.error).to.be.a('function');
  expect(val.complete).to.be.a('function');
  expect(val.isUnsubscribed).to.be.a('boolean');
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
          throw new Error('I told, you Bobby Boucher, twos are the debil!');
        }
      }).then(
        () => {
          done(new Error('should not be called'));
        },
        (err) => {
          results.push(err);
          expect(results).to.deep.equal([1, 2, new Error('I told, you Bobby Boucher, twos are the debil!')]);
          expect(unsubscribeCalled).to.be.true;
          done();
        });
    });

    it('should handle an asynchronous throw from the next handler and tear down', (done: MochaDone) => {
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
          throw new Error('I told, you Bobby Boucher, twos are the debil!');
        }
      }).then(
        () => {
          done(new Error('should not be called'));
        },
        (err) => {
          results.push(err);
          expect(results).to.deep.equal([1, 2, new Error('I told, you Bobby Boucher, twos are the debil!')]);
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
      expect(subscriber.isUnsubscribed).to.be.true;
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
          next: function next(x) {
            expect(this).to.equal(o);
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
          error: function error(err) {
            expect(this).to.equal(o);
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
          complete: function complete() {
            expect(this).to.equal(o);
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
          next: function next(x) {
            expect(this).to.equal(o);
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
});

/** @test {Observable} */
describe('Observable.lift', () => {
  it('should be overrideable in a custom Observable type that composes', (done: MochaDone) => {
    class MyCustomObservable<T> extends Rx.Observable<T> {
      lift<R>(operator: Rx.Operator<T, R>): Rx.Observable<R> {
        const observable = new MyCustomObservable<R>();
        (<any>observable).source = this;
        (<any>observable).operator = operator;
        return observable;
      }
    }

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
    class LogOperator<T, R> extends Rx.Operator<T, R> {
      constructor(private childOperator: Rx.Operator<T, R>) {
        super();
      }

      call(subscriber: Rx.Subscriber<R>, source: any): Rx.Subscription | Function | void {
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
