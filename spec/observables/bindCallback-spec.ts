import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {it, DoneSignature} from '../helpers/test-helper';

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

describe('Observable.bindCallback', () => {
  describe('when not scheduled', () => {
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

      expect(results).toEqual([42, 'done']);
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

      expect(results).toEqual([42, 'done']);
    });

    it('should emit an error when the selector throws', () => {
      function callback(cb) {
        cb(42);
      }
      const boundCallback = Observable.bindCallback(callback, (err: any) => { throw new Error('Yikes!'); });
      const results = [];

      boundCallback()
        .subscribe(() => {
          throw 'should not next';
        }, (err: any) => {
          results.push(err);
        }, () => {
          throw 'should not complete';
        });

      expect(results).toEqual([new Error('Yikes!')]);
    });

    it('should not emit, throw or complete if immediately unsubscribed', (done: DoneSignature) => {
      const nextSpy = jasmine.createSpy('next');
      const throwSpy = jasmine.createSpy('throw');
      const completeSpy = jasmine.createSpy('complete');
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
        expect(nextSpy).not.toHaveBeenCalled();
        expect(throwSpy).not.toHaveBeenCalled();
        expect(completeSpy).not.toHaveBeenCalled();

        clearTimeout(timeout);
        done();
      });
    });
  });

  describe('when scheduled', () => {
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

      expect(results).toEqual([42, 'done']);
    });

    it('should error if callback throws', () => {
      function callback(datum, cb) {
        throw new Error('haha no callback for you');
      }
      const boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
      const results = [];

      boundCallback(42)
        .subscribe((x: number) => {
          throw 'should not next';
        }, (err: any) => {
          results.push(err);
        }, () => {
          throw 'should not complete';
        });

      rxTestScheduler.flush();

      expect(results).toEqual([new Error('haha no callback for you')]);
    });

    it('should error if selector throws', () => {
      function callback(datum, cb) {
        cb(datum);
      }
      function selector() {
        throw new Error('what? a selector? I don\'t think so');
      }
      const boundCallback = Observable.bindCallback(callback, selector, rxTestScheduler);
      const results = [];

      boundCallback(42)
        .subscribe((x: any) => {
          throw 'should not next';
        }, (err: any) => {
          results.push(err);
        }, () => {
          throw 'should not complete';
        });

      rxTestScheduler.flush();

      expect(results).toEqual([new Error('what? a selector? I don\'t think so')]);
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

      expect(results).toEqual(['42!!!', 'done']);
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

    expect(results).toEqual([[42, 1, 2, 3], 'done']);
  });

  it('should pass multiple inner arguments to the selector if there is one', () => {
    function callback(datum, cb) {
      cb(datum, 1, 2, 3);
    }
    function selector(a, b, c, d) {
      expect([a, b, c, d]).toEqual([42, 1, 2, 3]);
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

    expect(results).toEqual([48, 'done']);
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

    source.subscribe((x: number) =>{
      results2.push(x);
    }, null, () => {
      results2.push('done');
    });

    rxTestScheduler.flush();

    expect(calls).toBe(1);
    expect(results1).toEqual([42, 'done']);
    expect(results2).toEqual([42, 'done']);
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

      expect(calls).toBe(0);
    });
});