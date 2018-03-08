import { expect } from 'chai';
import * as sinon from 'sinon';
import { bindNodeCallback } from '../../src';
import { TestScheduler } from '../../src/testing';

declare const rxTestScheduler: TestScheduler;

/** @test {bindNodeCallback} */
describe('bindNodeCallback', () => {
  describe('when not scheduled', () => {
    it('should emit undefined when callback is called without success arguments', () => {
      function callback(cb: Function) {
        cb(null);
      }

      const boundCallback = bindNodeCallback(callback);
      const results: Array<number | string> = [];

      boundCallback()
        .subscribe((x: any) => {
          results.push(typeof x);
        }, null, () => {
          results.push('done');
        });

      expect(results).to.deep.equal(['undefined', 'done']);
    });

    it('should emit one value from a callback', () => {
      function callback(datum: number, cb: Function) {
        cb(null, datum);
      }
      const boundCallback = bindNodeCallback<number>(callback);
      const results: Array<number | string> = [];

      boundCallback(42)
        .subscribe(x => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should set context of callback to context of boundCallback', () => {
      function callback(this: { datum: number }, cb: Function) {
        cb(null, this.datum);
      }
      const boundCallback = bindNodeCallback(callback);
      const results: Array<number | string> = [];

      boundCallback.call({datum: 42})
        .subscribe(
          (x: number) => results.push(x),
          null,
          () => results.push('done')
        );

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should raise error from callback', () => {
      const error = new Error();

      function callback(cb: Function) {
        cb(error);
      }

      const boundCallback = bindNodeCallback(callback);
      const results: Array<number | string> = [];

      boundCallback()
        .subscribe(() => {
          throw new Error('should not next');
        }, (err: any) => {
          results.push(err);
        }, () => {
          throw new Error('should not complete');
        });

      expect(results).to.deep.equal([error]);
    });

    it('should not emit, throw or complete if immediately unsubscribed', (done: MochaDone) => {
      const nextSpy = sinon.spy();
      const throwSpy = sinon.spy();
      const completeSpy = sinon.spy();
      let timeout: number;
      function callback(datum: number, cb: Function) {
        // Need to cb async in order for the unsub to trigger
        timeout = setTimeout(() => {
          cb(null, datum);
        });
      }
      const subscription = bindNodeCallback(callback)(42)
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
    it('should emit undefined when callback is called without success arguments', () => {
      function callback(cb: Function) {
        cb(null);
      }

      const boundCallback = bindNodeCallback(callback, rxTestScheduler);
      const results: Array<number | string> = [];

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
      function callback(datum: number, cb: Function) {
        cb(null, datum);
      }
      const boundCallback = bindNodeCallback<number>(callback, rxTestScheduler);
      const results: Array<number | string> = [];

      boundCallback(42)
        .subscribe(x => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      rxTestScheduler.flush();

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should set context of callback to context of boundCallback', () => {
      function callback(this: { datum: number }, cb: Function) {
        cb(null, this.datum);
      }
      const boundCallback = bindNodeCallback(callback, rxTestScheduler);
      const results: Array<number | string> = [];

      boundCallback.call({datum: 42})
        .subscribe(
          (x: number) => results.push(x),
          null,
          () => results.push('done')
        );

      rxTestScheduler.flush();

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should error if callback throws', () => {
      const expected = new Error('haha no callback for you');
      function callback(datum: number, cb: Function) {
        throw expected;
      }
      const boundCallback = bindNodeCallback(callback, rxTestScheduler);

      boundCallback(42)
        .subscribe(x => {
          throw new Error('should not next');
        }, (err: any) => {
          expect(err).to.equal(expected);
        }, () => {
          throw new Error('should not complete');
        });

      rxTestScheduler.flush();
    });

    it('should raise error from callback', () => {
      const error = new Error();

      function callback(cb: Function) {
        cb(error);
      }

      const boundCallback = bindNodeCallback(callback, rxTestScheduler);
      const results: Array<number | string> = [];

      boundCallback()
        .subscribe(() => {
          throw new Error('should not next');
        }, (err: any) => {
          results.push(err);
        }, () => {
          throw new Error('should not complete');
        });

      rxTestScheduler.flush();

      expect(results).to.deep.equal([error]);
    });
  });

  it('should pass multiple inner arguments as an array', () => {
    function callback(datum: number, cb: Function) {
      cb(null, datum, 1, 2, 3);
    }
    const boundCallback = bindNodeCallback<number[]>(callback, rxTestScheduler);
    const results: Array<number[] | string> = [];

    boundCallback(42)
      .subscribe(x => {
        results.push(x);
      }, null, () => {
        results.push('done');
      });

    rxTestScheduler.flush();

    expect(results).to.deep.equal([[42, 1, 2, 3], 'done']);
  });

  it('should cache value for next subscription and not call callbackFunc again', () => {
    let calls = 0;
    function callback(datum: number, cb: Function) {
      calls++;
      cb(null, datum);
    }
    const boundCallback = bindNodeCallback<number>(callback, rxTestScheduler);
    const results1: Array<number | string> = [];
    const results2: Array<number | string> = [];

    const source = boundCallback(42);

    source.subscribe(x => {
      results1.push(x);
    }, null, () => {
      results1.push('done');
    });

    source.subscribe(x => {
      results2.push(x);
    }, null, () => {
      results2.push('done');
    });

    rxTestScheduler.flush();

    expect(calls).to.equal(1);
    expect(results1).to.deep.equal([42, 'done']);
    expect(results2).to.deep.equal([42, 'done']);
  });
});
