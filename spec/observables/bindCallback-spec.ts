import { expect } from 'chai';
import * as sinon from 'sinon';
import { bindCallback } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

declare const rxTestScheduler: TestScheduler;

/** @test {bindCallback} */
describe('bindCallback', () => {
  describe('when not scheduled', () => {
    it('should emit undefined from a callback without arguments', () => {
      function callback(cb: Function) {
        cb();
      }
      const boundCallback = bindCallback(callback);
      const results: Array<string|number> = [];

      boundCallback()
        .subscribe((x: any) => {
          results.push(typeof x);
        }, null, () => {
          results.push('done');
        });

      expect(results).to.deep.equal(['undefined', 'done']);
    });

    it('should still support deprecated resultSelector', () => {
      function callback(datum: number, cb: Function) {
        cb(datum);
      }

      const boundCallback = bindCallback(
        callback,
        (datum: any) => datum + 1,
      );

      const results: Array<string|number> = [];

      boundCallback(42)
        .subscribe({
          next(value) { results.push(value); },
          complete() { results.push('done'); },
        });

      expect(results).to.deep.equal([43, 'done']);
    });

    it('should still support deprecated resultSelector if its void', () => {
      function callback(datum: number, cb: Function) {
        cb(datum);
      }

      const boundCallback = bindCallback(
        callback,
        void 0,
      );

      const results: Array<string|number> = [];

      boundCallback(42)
        .subscribe({
          next(value) { results.push(value); },
          complete() { results.push('done'); },
        });

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should emit one value from a callback', () => {
      function callback(datum: number, cb: (result: number) => void) {
        cb(datum);
      }
      const boundCallback = bindCallback(callback);
      const results: Array<string|number> = [];

      boundCallback(42)
        .subscribe(x => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should set callback function context to context of returned function', () => {
      function callback(this: any, cb: Function) {
        cb(this.datum);
      }

      const boundCallback = bindCallback(callback);
      const results: Array<string|number> = [];

      boundCallback.apply({datum: 5})
        .subscribe(
          (x: number) => results.push(x),
          null,
          () => results.push('done')
        );

      expect(results).to.deep.equal([5, 'done']);
    });

    it('should not emit, throw or complete if immediately unsubscribed', (done: MochaDone) => {
      const nextSpy = sinon.spy();
      const throwSpy = sinon.spy();
      const completeSpy = sinon.spy();
      let timeout: number;
      function callback(datum: number, cb: Function) {
        // Need to cb async in order for the unsub to trigger
        timeout = setTimeout(() => {
          cb(datum);
        });
      }
      const subscription = bindCallback(callback)(42)
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
      function callback(cb: Function) {
        cb();
      }
      const boundCallback = bindCallback(callback, rxTestScheduler);
      const results: Array<string|number> = [];

      boundCallback()
        .subscribe(x => {
          results.push(typeof x);
        }, null, () => {
          results.push('done');
        });

      rxTestScheduler.flush();

      expect(results).to.deep.equal(['undefined', 'done']);
    });

    it('should emit one value from a callback', () => {
      function callback(datum: number, cb: (result: number) => void) {
        cb(datum);
      }
      const boundCallback = bindCallback(callback, rxTestScheduler);
      const results: Array<string|number> = [];

      boundCallback(42)
        .subscribe(x => {
          results.push(x);
        }, null, () => {
          results.push('done');
        });

      rxTestScheduler.flush();

      expect(results).to.deep.equal([42, 'done']);
    });

    it('should set callback function context to context of returned function', () => {
      function callback(this: { datum: number }, cb: Function) {
        cb(this.datum);
      }

      const boundCallback = bindCallback(callback, rxTestScheduler);
      const results: Array<string|number> = [];

      boundCallback.apply({ datum: 5 })
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
      function callback(datum: number, cb: Function): never {
        throw expected;
      }
      const boundCallback = bindCallback(callback, rxTestScheduler);

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

  it('should pass multiple inner arguments as an array', () => {
    function callback(datum: number, cb: (a: number, b: number, c: number, d: number) => void) {
      cb(datum, 1, 2, 3);
    }
    const boundCallback = bindCallback(callback, rxTestScheduler);
    const results: Array<string|number[]> = [];

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
    function callback(datum: number, cb: (x: number) => void) {
      calls++;
      cb(datum);
    }
    const boundCallback = bindCallback(callback, rxTestScheduler);
    const results1: Array<number|string> = [];
    const results2: Array<number|string> = [];

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

  it('should not even call the callbackFn if immediately unsubscribed', () => {
      let calls = 0;
      function callback(datum: number, cb: Function) {
        calls++;
        cb(datum);
      }
      const boundCallback = bindCallback(callback, rxTestScheduler);
      const results1: Array<number|string> = [];

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

  it('should not swallow post-callback errors', () => {
    function badFunction(callback: (answer: number) => void): void {
      callback(42);
      throw new Error('kaboom');
    }
    const consoleStub = sinon.stub(console, 'warn');
    try {
      bindCallback(badFunction)().subscribe();
      expect(consoleStub).to.have.property('called', true);
    } finally {
      consoleStub.restore();
    }
  });
});
