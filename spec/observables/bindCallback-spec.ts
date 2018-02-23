import { expect } from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../../src/Rx';

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {bindCallback} */
describe('Observable.bindCallback', () => {
  describe('when not scheduled', () => {
    it('should emit undefined from a callback without arguments', () => {
      function callback(cb: Function) {
        cb();
      }
      const boundCallback = Observable.bindCallback(callback);
      const results: string[] = [];

      boundCallback()
        .subscribe((x) => {
          results.push(typeof x);
        }, null, () => {
          results.push('done');
        });

      expect(results).to.deep.equal(['undefined', 'done']);
    });

    it('should emit one value from a callback', () => {
      function callback(datum: number, cb: (value: number) => void) {
        cb(datum);
      }
      const boundCallback = Observable.bindCallback(callback);
      const results: Array<number | string> = [];

      boundCallback(42)
        .subscribe((x) => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should set callback function context to context of returned function', () => {
      function callback<T>(this: { datum: T; }, cb: (value: T) => void) {
        cb(this.datum);
      }

      const boundCallback = Observable.bindCallback(callback);
      const results: Array<number | string> = [];

      boundCallback.apply({datum: 5})
        .subscribe(
          (x: number) => results.push(x),
          null,
          () => results.push('done')
        );

      expect(results).to.deep.equal([5, 'done']);
    });

    it('should emit one value chosen by a selector', () => {
      function callback(datum: number, cb: (value: number) => void) {
        cb(datum);
      }
      const boundCallback = Observable.bindCallback(callback, (datum: any) => datum);
      const results: Array<string | number> = [];

      boundCallback(42)
        .subscribe((x) => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should emit an error when the selector throws', () => {
      const expected = new Error('Yikes!');
      function callback(cb: (value: number) => void) {
        cb(42);
      }
      const boundCallback = Observable.bindCallback(callback, (err: any) => { throw expected; });

      boundCallback()
        .subscribe(() => {
          throw 'should not next';
        }, (err) => {
          expect(err).to.equal(expected);
        }, () => {
          throw 'should not complete';
        });
    });

    it('should not emit, throw or complete if immediately unsubscribed', (done) => {
      const nextSpy = sinon.spy();
      const throwSpy = sinon.spy();
      const completeSpy = sinon.spy();
      let timeout: number;
      function callback(datum: number, cb: (value: number) => void) {
        // Need to cb async in order for the unsub to trigger
        timeout = setTimeout(() => {
          cb(datum);
        });
      }
      const subscription = Observable.bindCallback(callback)(42)
        .subscribe(nextSpy, throwSpy, completeSpy);
      subscription.unsubscribe();

      setTimeout(() => {
        expect(nextSpy).not.have.been.called;
        expect(throwSpy).not.have.been.called;
        expect(completeSpy).not.have.been.called;

        clearTimeout(timeout);
        done();
      });
    });
  });

  describe('when scheduled', () => {
    it('should emit undefined from a callback without arguments', () => {
      function callback(cb: (value?: number) => void) {
        cb();
      }
      const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
      const results: string[] = [];

      boundCallback()
        .subscribe((x) => {
          results.push(typeof x);
        }, null, () => {
          results.push('done');
        });

      rxTestScheduler.flush();

      expect(results).to.deep.equal(['undefined', 'done']);
    });

    it('should emit one value from a callback', () => {
      function callback(datum: number, cb: (value: number) => void) {
        cb(datum);
      }
      const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
      const results: Array<string | number> = [];

      boundCallback(42)
        .subscribe((x) => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      rxTestScheduler.flush();

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should set callback function context to context of returned function', () => {
      function callback<T>(this: { datum: T; }, cb: (value: T) => void) {
        cb(this.datum);
      }

      const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
      const results: Array<string | number> = [];

      boundCallback.apply({datum: 5})
        .subscribe(
          (x: number) => results.push(x),
          null,
          () => results.push('done')
        );

      rxTestScheduler.flush();

      expect(results).to.deep.equal([5, 'done']);
    });

    it('should error if callback throws', () => {
      const expected = new Error('haha no callback for you');
      function callback(datum: number, cb: (value: number) => void) {
        throw expected;
      }
      const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);

      boundCallback(42)
        .subscribe((x) => {
          throw 'should not next';
        }, (err) => {
          expect(err).to.equal(expected);
        }, () => {
          throw 'should not complete';
        });

      rxTestScheduler.flush();
    });

    it('should error if selector throws', () => {
      const expected = new Error('what? a selector? I don\'t think so');
      function callback(datum: number, cb: (value: number) => void) {
        cb(datum);
      }
      function selector() {
        throw expected;
      }
      const boundCallback = Observable.bindCallback(callback, selector, rxTestScheduler);

      boundCallback(42)
        .subscribe((x) => {
          throw 'should not next';
        }, (err) => {
          expect(err).to.equal(expected);
        }, () => {
          throw 'should not complete';
        });

      rxTestScheduler.flush();
    });

    it('should use a selector', () => {
      function callback(datum: number, cb: (value: number) => void) {
        cb(datum);
      }
      function selector(x: number) {
        return x + '!!!';
      }
      const boundCallback = Observable.bindCallback(callback, selector, rxTestScheduler);
      const results: Array<string> = [];

      boundCallback(42)
        .subscribe((x) => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      rxTestScheduler.flush();

      expect(results).to.deep.equal(['42!!!', 'done']);
    });
  });

  it('should pass multiple inner arguments as an array', () => {
    function callback(datum: number, cb: (value: number, a: number, b: number, c: number) => void) {
      cb(datum, 1, 2, 3);
    }
    const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
    const results: Array<number | string> = [];

    boundCallback(42)
      .subscribe((x) => {
        results.push(x);
      }, null, () => {
        results.push('done');
      });

    rxTestScheduler.flush();

    expect(results).to.deep.equal([[42, 1, 2, 3], 'done']);
  });

  it('should pass multiple inner arguments to the selector if there is one', () => {
    function callback(datum: number, cb: (value: number, a: number, b: number, c: number) => void) {
      cb(datum, 1, 2, 3);
    }
    function selector(a: number, b: number, c: number, d: number) {
      expect([a, b, c, d]).to.deep.equal([42, 1, 2, 3]);
      return a + b + c + d;
    }
    const boundCallback = Observable.bindCallback(callback, selector, rxTestScheduler);
    const results: Array<number | string> = [];

    boundCallback(42)
      .subscribe((x) => {
        results.push(x);
      }, null, () => {
        results.push('done');
      });

    rxTestScheduler.flush();

    expect(results).to.deep.equal([48, 'done']);
  });

  it('should cache value for next subscription and not call callbackFunc again', () => {
    let calls = 0;
    function callback(datum: number, cb: (value: number) => void) {
      calls++;
      cb(datum);
    }
    const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
    const results1: Array<string | number> = [];
    const results2: Array<string | number> = [];

    const source = boundCallback(42);

    source.subscribe((x) => {
      results1.push(x);
    }, null, () => {
      results1.push('done');
    });

    source.subscribe((x) => {
      results2.push(x);
    }, null, () => {
      results2.push('done');
    });

    rxTestScheduler.flush();

    expect(calls).to.equal(1);
    expect(results1).to.deep.equal([42, 'done']);
    expect(results2).to.deep.equal([42, 'done']);
  });

  it('should not even call the callbackFn if immediately unsubscribed', () => {
      let calls = 0;
      function callback(datum: number, cb: (value: number) => void) {
        calls++;
        cb(datum);
      }
      const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
      const results1: Array<string | number> = [];

      const source = boundCallback(42);

      const subscription = source.subscribe((x) => {
        results1.push(x);
      }, null, () => {
        results1.push('done');
      });

      subscription.unsubscribe();

      rxTestScheduler.flush();

      expect(calls).to.equal(0);
    });
});
