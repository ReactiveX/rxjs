import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import {subscribeToResult} from '../../dist/cjs/util/subscribeToResult';
import {OuterSubscriber} from '../../dist/cjs/OuterSubscriber';
import {$$iterator} from '../../dist/cjs/symbol/iterator';
import $$symbolObservable from 'symbol-observable';

describe('subscribeToResult', () => {
  it('should synchronously complete when subscribe to scalarObservable', () => {
    const result = Rx.Observable.of(42);
    let expected: number;
    const subscriber = new OuterSubscriber((x: number) => expected = x);

    const subscription = subscribeToResult(subscriber, result);

    expect(expected).to.be.equal(42);
    expect(subscription).to.be.null;
  });

  it('should subscribe to observables that are an instanceof Rx.Observable', (done: MochaDone) => {
    const expected = [1, 2, 3];
    const result = Rx.Observable.range(1, 3);

    const subscriber = new OuterSubscriber(x => {
      expect(expected.shift()).to.be.equal(x);
    }, () => {
      done(new Error('should not be called'));
    }, () => {
      expect(expected).to.be.empty;
      done();
    });

    subscribeToResult(subscriber, result);
  });

  it('should emit error when observable emits error', (done: MochaDone) => {
    const result = Rx.Observable.throw(new Error('error'));
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
    const expected = [];

    const subscriber = new OuterSubscriber(x => expected.push(x));

    subscribeToResult(subscriber, result);

    expect(expected).to.be.deep.equal(result);
  });

  it('should subscribe to a promise', (done: MochaDone) => {
    const result = Promise.resolve(42);

    const subscriber = new OuterSubscriber(x => {
      expect(x).to.be.equal(42);
    }, () => {
      done(new Error('should not be called'));
    }, done);

    subscribeToResult(subscriber, result);
  });

  it('should emits error when the promise rejects', (done: MochaDone) => {
    const result = Promise.reject(42);

    const subscriber = new OuterSubscriber(x => {
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
      [$$iterator]: () => {
      return {
        next: () => {
          return iteratorResults.shift();
        }
      };
    }};

    const subscriber = new OuterSubscriber((x: number) => expected = x);

    subscribeToResult(subscriber, iterable);
    expect(expected).to.be.equal(42);
  });

  it('should subscribe to to an object that implements Symbol.observable', (done: MochaDone) => {
    const observableSymbolObject = { [$$symbolObservable]: () => Rx.Observable.of(42) };

    const subscriber = new OuterSubscriber(x => {
      expect(x).to.be.equal(42);
    }, () => {
      done(new Error('should not be called'));
    }, done);

    subscribeToResult(subscriber, observableSymbolObject);
  });

  it('should emit an error if value returned by Symbol.observable call is not a valid observable', (done: MochaDone) => {
    const observableSymbolObject = { [$$symbolObservable]: () => ({}) };

    const subscriber = new OuterSubscriber(x => {
      done(new Error('should not be called'));
    }, (x) => {
      expect(x).to.be.an('error', 'invalid observable');
      done();
    }, () => {
      done(new Error('should not be called'));
    });

    subscribeToResult(subscriber, observableSymbolObject);
  });

  it('should emit an error when trying to subscribe to an unknown type of object', (done: MochaDone) => {
    const subscriber = new OuterSubscriber(x => {
      done(new Error('should not be called'));
    }, (x) => {
      expect(x).to.be.an('error', 'unknown type returned');
      done();
    }, () => {
      done(new Error('should not be called'));
    });

    subscribeToResult(subscriber, {});
  });
});