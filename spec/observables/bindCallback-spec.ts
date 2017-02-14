import {expect} from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../../dist/cjs/Rx';

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {bindCallback} */
describe('Observable.bindCallback', () => {
  describe('when not scheduled', () => {
    it('should emit undefined from a callback without arguments', () => {
      function callback(cb) {
        cb();
      }
      const boundCallback = Observable.bindCallback(callback);
      const results = [];

      boundCallback()
        .subscribe((x: any) => {
          results.push(typeof x);
        }, null, () => {
          results.push('done');
        });

      expect(results).to.deep.equal(['undefined', 'done']);
    });

    it('should emit one value from a callback', () => {
      function callback(datum, cb) {
        cb(datum);
      }
      const boundCallback = Observable.bindCallback(callback);
      const results = [];

      boundCallback(42)
        .subscribe((x: number) => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should set callback function context to context of returned function', () => {
      function callback(cb) {
        cb(this.datum);
      }

      const boundCallback = Observable.bindCallback(callback);
      const results = [];

      boundCallback.apply({datum: 5})
        .subscribe(
          (x: number) => results.push(x),
          null,
          () => results.push('done')
        );

      expect(results).to.deep.equal([5, 'done']);
    });

    it('should emit one value chosen by a selector', () => {
      function callback(datum, cb) {
        cb(datum);
      }
      const boundCallback = Observable.bindCallback(callback, (datum: any) => datum);
      const results = [];

      boundCallback(42)
        .subscribe((x: number) => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should emit an error when the selector throws', () => {
      const expected = new Error('Yikes!');
      function callback(cb) {
        cb(42);
      }
      const boundCallback = Observable.bindCallback(callback, (err: any) => { throw expected; });

      boundCallback()
        .subscribe(() => {
          throw 'should not next';
        }, (err: any) => {
          expect(err).to.equal(expected);
        }, () => {
          throw 'should not complete';
        });
    });

    it('should not emit, throw or complete if immediately unsubscribed', (done: MochaDone) => {
      const nextSpy = sinon.spy();
      const throwSpy = sinon.spy();
      const completeSpy = sinon.spy();
      let timeout;
      function callback(datum, cb) {
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
      function callback(cb) {
        cb();
      }
      const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
      const results = [];

      boundCallback()
        .subscribe((x: any) => {
          results.push(typeof x);
        }, null, () => {
          results.push('done');
        });

      rxTestScheduler.flush();

      expect(results).to.deep.equal(['undefined', 'done']);
    });

    it('should emit one value from a callback', () => {
      function callback(datum, cb) {
        cb(datum);
      }
      const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
      const results = [];

      boundCallback(42)
        .subscribe((x: number) => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      rxTestScheduler.flush();

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should set callback function context to context of returned function', () => {
      function callback(cb) {
        cb(this.datum);
      }

      const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
      const results = [];

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
      function callback(datum, cb) {
        throw expected;
      }
      const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);

      boundCallback(42)
        .subscribe((x: number) => {
          throw 'should not next';
        }, (err: any) => {
          expect(err).to.equal(expected);
        }, () => {
          throw 'should not complete';
        });

      rxTestScheduler.flush();
    });

    it('should error if selector throws', () => {
      const expected = new Error('what? a selector? I don\'t think so');
      function callback(datum, cb) {
        cb(datum);
      }
      function selector() {
        throw expected;
      }
      const boundCallback = Observable.bindCallback(callback, selector, rxTestScheduler);

      boundCallback(42)
        .subscribe((x: any) => {
          throw 'should not next';
        }, (err: any) => {
          expect(err).to.equal(expected);
        }, () => {
          throw 'should not complete';
        });

      rxTestScheduler.flush();
    });

    it('should use a selector', () => {
      function callback(datum, cb) {
        cb(datum);
      }
      function selector(x) {
        return x + '!!!';
      }
      const boundCallback = Observable.bindCallback(callback, selector, rxTestScheduler);
      const results = [];

      boundCallback(42)
        .subscribe((x: string) => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      rxTestScheduler.flush();

      expect(results).to.deep.equal(['42!!!', 'done']);
    });
  });

  it('should pass multiple inner arguments as an array', () => {
    function callback(datum, cb) {
      cb(datum, 1, 2, 3);
    }
    const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
    const results = [];

    boundCallback(42)
      .subscribe((x: number) => {
        results.push(x);
      }, null, () => {
        results.push('done');
      });

    rxTestScheduler.flush();

    expect(results).to.deep.equal([[42, 1, 2, 3], 'done']);
  });

  it('should pass multiple inner arguments to the selector if there is one', () => {
    function callback(datum, cb) {
      cb(datum, 1, 2, 3);
    }
    function selector(a, b, c, d) {
      expect([a, b, c, d]).to.deep.equal([42, 1, 2, 3]);
      return a + b + c + d;
    }
    const boundCallback = Observable.bindCallback(callback, selector, rxTestScheduler);
    const results = [];

    boundCallback(42)
      .subscribe((x: number) => {
        results.push(x);
      }, null, () => {
        results.push('done');
      });

    rxTestScheduler.flush();

    expect(results).to.deep.equal([48, 'done']);
  });

  it('should cache value for next subscription and not call callbackFunc again', () => {
    let calls = 0;
    function callback(datum, cb) {
      calls++;
      cb(datum);
    }
    const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
    const results1 = [];
    const results2 = [];

    const source = boundCallback(42);

    source.subscribe((x: number) => {
      results1.push(x);
    }, null, () => {
      results1.push('done');
    });

    source.subscribe((x: number) => {
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
      function callback(datum, cb) {
        calls++;
        cb(datum);
      }
      const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
      const results1 = [];

      const source = boundCallback(42);

      const subscription = source.subscribe((x: any) => {
        results1.push(x);
      }, null, () => {
        results1.push('done');
      });

      subscription.unsubscribe();

      rxTestScheduler.flush();

      expect(calls).to.equal(0);
    });
});