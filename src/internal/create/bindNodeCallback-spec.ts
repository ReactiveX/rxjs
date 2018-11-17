import { expect } from 'chai';
import * as sinon from 'sinon';
import { bindNodeCallback } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {bindNodeCallback} */
describe('bindNodeCallback', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

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
      function callback(datum: number, cb: (err: any, n: number) => void) {
        cb(null, datum);
      }
      const boundCallback = bindNodeCallback(callback);
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
      function callback(this: { datum: number }, cb: (err: any, n: number) => void) {
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
      function callback(datum: number, cb: (err: any, n: number) => void) {
        // Need to cb async in order for the unsub to trigger
        timeout = setTimeout(() => {
          cb(null, datum);
        });
      }
      const subscription = bindNodeCallback(callback)(42)
        .subscribe(nextSpy, throwSpy, completeSpy);
      subscription.unsubscribe();

      setTimeout(() => {
        expect(nextSpy.called, 'next to not be called').to.be.false;
        expect(throwSpy.called, 'error to not be called').to.be.false;
        expect(completeSpy.called, 'complete to not be called').to.be.false;

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

      const boundCallback = bindNodeCallback(callback, testScheduler);
      const results: Array<number | string> = [];

      boundCallback()
        .subscribe((x: any) => {
          results.push(typeof x);
        }, null, () => {
          results.push('done');
        });

      testScheduler.flush();

      expect(results).to.deep.equal(['undefined', 'done']);
    });

    it('should emit one value from a callback', () => {
      function callback(datum: number, cb: (err: any, n: number) => void) {
        cb(null, datum);
      }
      const boundCallback = bindNodeCallback(callback, testScheduler);
      const results: Array<number | string> = [];

      boundCallback(42)
        .subscribe(x => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      testScheduler.flush();

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should set context of callback to context of boundCallback', () => {
      function callback(this: { datum: number }, cb: (err: any, n: number) => void) {
        cb(null, this.datum);
      }
      const boundCallback = bindNodeCallback(callback, testScheduler);
      const results: Array<number | string> = [];

      boundCallback.call({datum: 42})
        .subscribe(
          (x: number) => results.push(x),
          null,
          () => results.push('done')
        );

      testScheduler.flush();

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should error if callback throws', () => {
      const expected = new Error('haha no callback for you');
      function callback(datum: number, cb: (err: any, n: number) => void) {
        throw expected;
      }
      const boundCallback = bindNodeCallback(callback, testScheduler);

      boundCallback(42)
        .subscribe(x => {
          throw new Error('should not next');
        }, (err: any) => {
          expect(err).to.equal(expected);
        }, () => {
          throw new Error('should not complete');
        });

      testScheduler.flush();
    });

    it('should raise error from callback', () => {
      const error = new Error();

      function callback(cb: Function) {
        cb(error);
      }

      const boundCallback = bindNodeCallback(callback, testScheduler);
      const results: Array<number | string> = [];

      boundCallback()
        .subscribe(() => {
          throw new Error('should not next');
        }, (err: any) => {
          results.push(err);
        }, () => {
          throw new Error('should not complete');
        });

      testScheduler.flush();

      expect(results).to.deep.equal([error]);
    });
  });

  it('should pass multiple inner arguments as an array', () => {
    function callback(datum: number, cb: (err: any, a: number, b: number, c: number, d: number) => void) {
      cb(null, datum, 1, 2, 3);
    }
    const boundCallback = bindNodeCallback(callback, testScheduler);
    const results: Array<number[] | string> = [];

    boundCallback(42)
      .subscribe(x => {
        results.push(x);
      }, null, () => {
        results.push('done');
      });

    testScheduler.flush();

    expect(results).to.deep.equal([[42, 1, 2, 3], 'done']);
  });

  it('should cache value for next subscription and not call callbackFunc again', () => {
    let calls = 0;
    function callback(datum: number, cb: (err: any, n: number) => void) {
      calls++;
      cb(null, datum);
    }
    const boundCallback = bindNodeCallback(callback, testScheduler);
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

    testScheduler.flush();

    expect(calls).to.equal(1);
    expect(results1).to.deep.equal([42, 'done']);
    expect(results2).to.deep.equal([42, 'done']);
  });

  // TODO: canReportError
  it.skip('should not swallow post-callback errors', () => {
    function badFunction(callback: (error: Error, answer: number) => void): void {
      callback(null, 42);
      throw new Error('kaboom');
    }
    const consoleStub = sinon.stub(console, 'warn');
    try {
      bindNodeCallback(badFunction)().subscribe();
      expect(consoleStub).to.have.property('called', true);
    } finally {
      consoleStub.restore();
    }
  });
});
