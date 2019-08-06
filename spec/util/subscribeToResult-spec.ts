import { expect } from 'chai';
import { OuterSubscriber } from 'rxjs/internal/OuterSubscriber';
import { subscribeToResult } from 'rxjs/internal/util/subscribeToResult';
import { iterator } from 'rxjs/internal/symbol/iterator';
import $$symbolObservable from 'symbol-observable';
import { of, range, throwError } from 'rxjs';

describe('subscribeToResult', () => {
  it('should synchronously complete when subscribed to scalarObservable', () => {
    const result = of(42);
    let expected: number;
    const subscriber = new OuterSubscriber<number, number>((x) => expected = x);

    const subscription = subscribeToResult(subscriber, result);

    expect(expected).to.be.equal(42);
    expect(subscription.closed).to.be.true;
  });

  it('should subscribe to observables that are an instanceof Observable', (done) => {
    const expected = [1, 2, 3];
    const result = range(1, 3);

    const subscriber = new OuterSubscriber<number, number>(x => {
      expect(expected.shift()).to.be.equal(x);
    }, () => {
      done(new Error('should not be called'));
    }, () => {
      expect(expected).to.be.empty;
      done();
    });

    subscribeToResult(subscriber, result);
  });

  it('should emit error when observable emits error', (done) => {
    const result = throwError(new Error('error'));
    const subscriber = new OuterSubscriber(x => {
      done(new Error('should not be called'));
    }, (err) => {
      expect(err).to.be.an('error', 'error');
      done();
    }, () => {
      done(new Error('should not be called'));
    });

    subscribeToResult(subscriber, result);
  });

  it('should subscribe to an array and emit synchronously', () => {
    const result = [1, 2, 3];
    const expected: number[] = [];

    const subscriber = new OuterSubscriber<number, number>(x => expected.push(x));

    subscribeToResult(subscriber, result);

    expect(expected).to.be.deep.equal(result);
  });

  it('should subscribe to an array-like and emit synchronously', () => {
    const result = { 0: 0, 1: 1, 2: 2, length: 3 };
    const expected: number[] = [];

    const subscriber = new OuterSubscriber<number, number>(x => expected.push(x));

    subscribeToResult(subscriber, result);

    expect(expected).to.be.deep.equal([0, 1, 2]);
  });

  it('should subscribe to a promise', (done) => {
    const result = Promise.resolve(42);

    const subscriber = new OuterSubscriber<number, number>(x => {
      expect(x).to.be.equal(42);
    }, () => {
      done(new Error('should not be called'));
    }, done);

    subscribeToResult(subscriber, result);
  });

  it('should emits error when the promise rejects', (done) => {
    const result = Promise.reject(42);

    const subscriber = new OuterSubscriber<number, number>(x => {
      done(new Error('should not be called'));
    }, (x) => {
      expect(x).to.be.equal(42);
      done();
    }, () => {
      done(new Error('should not be called'));
    });

    subscribeToResult(subscriber, result);
  });

  it('should subscribe an iterable and emit results synchronously', () => {
    let expected: number;
    const iteratorResults = [
      { value: 42, done: false },
      { done: true }
    ];

    const iterable = {
      [iterator]: () => {
        return {
          next: () => {
            return iteratorResults.shift();
          }
        };
      }
    };

    const subscriber = new OuterSubscriber((x: number) => expected = x);

    subscribeToResult(subscriber, iterable);
    expect(expected).to.be.equal(42);
  });

  it('should subscribe to to an object that implements Symbol.observable', (done) => {
    const observableSymbolObject = { [$$symbolObservable]: () => of(42) };

    const subscriber = new OuterSubscriber(x => {
      expect(x).to.be.equal(42);
    }, () => {
      done(new Error('should not be called'));
    }, done);

    subscribeToResult(subscriber, observableSymbolObject);
  });

  it('should throw an error if value returned by Symbol.observable call is not ' +
    'a valid observable', () => {
      const observableSymbolObject = { [$$symbolObservable]: () => ({}) };

      const subscriber = new OuterSubscriber(x => {
        throw new Error('should not be called');
      }, (x) => {
        throw new Error('should not be called');
      }, () => {
        throw new Error('should not be called');
      });

      expect(() => subscribeToResult(subscriber, observableSymbolObject))
        .to.throw(TypeError, 'Provided object does not correctly implement Symbol.observable');
    });

  it('should emit an error when trying to subscribe to an unknown type of object', () => {
    const subscriber = new OuterSubscriber(x => {
      throw new Error('should not be called');
    }, (x) => {
      throw new Error('should not be called');
    }, () => {
      throw new Error('should not be called');
    });

    expect(() => subscribeToResult(subscriber, {}))
      .to.throw(TypeError, 'You provided an invalid object where a stream was expected. You can provide an Observable, Promise, Array, or Iterable.');
  });

  it('should emit an error when trying to subscribe to a non-object', () => {
    const subscriber = new OuterSubscriber(x => {
      throw new Error('should not be called');
    }, (x) => {
      throw new Error('should not be called');
    }, () => {
      throw new Error('should not be called');
    });

    expect(() => subscribeToResult(subscriber, null))
      .to.throw(TypeError, `You provided 'null' where a stream was expected. You can provide an Observable, Promise, Array, or Iterable.`);
  });
});
