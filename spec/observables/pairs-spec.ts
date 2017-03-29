import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

describe('Observable.pairs', () => {
  asDiagram('pairs({a: 1, b: 2, c: 3})')('should create an observable emits key-value pair', () => {
    const e1 = Observable.pairs({a: 1, b: 2, c: 3}, rxTestScheduler)
    // for the purpose of making a nice diagram, spread out the synchronous emissions
    .concatMap((x, i) => Observable.of(x).delay(i === 0 ? 0 : 20, rxTestScheduler));
    const expected = 'a-b-(c|)';
    const values = {
      a: ['a', 1],
      b: ['b', 2],
      c: ['c', 3]
    };

    expectObservable(e1).toBe(expected, values);
  });

  it('should create an observable without scheduler', (done: MochaDone) => {
    let expected = [
      ['a', 1],
      ['b', 2],
      ['c', 3]
    ];

    Observable.pairs({a: 1, b: 2, c: 3}).subscribe(x => {
      expect(x).to.deep.equal(expected.shift());
    }, x => {
      done(new Error('should not be called'));
    }, () => {
      expect(expected).to.be.empty;
      done();
    });
  });

  it('should work with empty object', () => {
    const e1 = Observable.pairs({}, rxTestScheduler);
    const expected = '|';

    expectObservable(e1).toBe(expected);
  });
});
