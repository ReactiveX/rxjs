import * as Rx from '../../dist/cjs/Rx.KitchenSink';
declare const expectObservable: any;
import {DoneSignature} from '../helpers/test-helper';
import {$$iterator} from '../../dist/cjs/symbol/iterator';

declare const Symbol: any;
declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {from} */
describe('Observable.from', () => {
  it('should enumerate an Array', (done: DoneSignature) => {
    const expected = [1, 2, 3];
    let i = 0;

    Observable.from(expected).subscribe((x: number) => {
      expect(x).toBe(expected[i++]);
    }, (x) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  }, 300);

  it('should handle an ArrayLike', (done: DoneSignature) => {
    const arrayLike = {
      length: 3,
      0: 1,
      1: 2,
      2: 3
    };
    const expected = [1, 2, 3];

    Observable.from(arrayLike).subscribe((x: number) =>  {
      expect(x).toBe(expected.shift());
    }, (x) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  }, 300);

  it('should handle an ArrayLike from arguments', (done: DoneSignature) => {
    function makeArrayLike(...args) {
      const expected = [1, 2, 3];

      Observable.from(arguments).subscribe((x: number) => {
        expect(x).toBe(expected.shift());
      }, (x) => {
        done.fail('should not be called');
      }, () => {
        done();
      });
    }

    makeArrayLike(1, 2, 3);
  }, 300);

  it('should handle an ArrayLike with a mapFn', (done: DoneSignature) => {
    const arrayLike = {
      length: 3,
      0: 1,
      1: 2,
      2: 3
    };
    const expected = [1, 1, 1];
    const mapFn = (v, k) => v - k;

    Observable.from(arrayLike, mapFn).subscribe((x: number) =>  {
      expect(x).toBe(expected.shift());
    }, (x) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  }, 300);

  it('should handle an ArrayLike with a thisArg', (done: DoneSignature) => {
    const arrayLike = {
      length: 3,
      0: 1,
      1: 2,
      2: 3
    };
    const expected = [123, 123, 123];
    const mapFn = function (x, y) {
      return this.thing;
    };

    Observable.from(arrayLike, mapFn, {thing: 123}).subscribe((x: number) =>  {
      expect(x).toBe(expected.shift());
    }, (x) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  });

  it('should handle a promise', (done: DoneSignature) => {
    const promise = Promise.resolve('pinky swear');

    Observable.from(promise).subscribe((x: string) =>  {
      expect(x).toBe('pinky swear');
    }, (x) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  });

  it('should handle an "observableque" object', (done: DoneSignature) => {
    const observablesque = {};

    observablesque[Symbol.observable] = () => {
      return {
        subscribe: (observer: Rx.Observer<string>) => {
          observer.next('test');
          observer.complete();
        }
      };
    };

    Observable.from(observablesque).subscribe((x: string) =>  {
      expect(x).toBe('test');
    }, (x) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  });

  it('should accept scheduler for observableque object', () => {
    const observablesque = {};

    observablesque[Symbol.observable] = () => {
      return {
        subscribe: (observer: Rx.Observer<string>) => {
          observer.next('x');
          observer.complete();
        }
      };
    };

    const e1 = Observable.from(observablesque, rxTestScheduler);
    const expected = '(x|)';

    expectObservable(e1).toBe(expected);
  });

  it('should handle a string', (done: DoneSignature) => {
    const expected = ['a', 'b', 'c'];
    Observable.from('abc').subscribe((x: string) =>  {
      expect(x).toBe(expected.shift());
    }, (x) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  });

  it('should handle any iterable thing', (done: DoneSignature) => {
    const iterable = {};
    const iteratorResults = [
      { value: 'one', done: false },
      { value: 'two', done: false },
      { done: true }
    ];
    const expected = ['one', 'two'];

    expect($$iterator).toBe(Symbol.iterator);

    iterable[Symbol.iterator] = () => {
      return {
        next: () => {
          return iteratorResults.shift();
        }
      };
    };

    Observable.from(iterable).subscribe((x: string) =>  {
      expect(x).toBe(expected.shift());
    }, (x) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  });

  it('should throw for non observable object', () => {
    const r = () => {
      Observable.from({}).subscribe();
    };

    expect(r).toThrow();
  });

  it('should handle object has observable symbol', (done: DoneSignature) => {
    const value = 'x';

    Observable.from(Observable.of(value)).subscribe((x: string) =>  {
      expect(x).toBe(value);
    }, (err: any) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  });
});
