import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const expectObservable: typeof marbleTestingSignature.expectObservable;

const Observable = Rx.Observable;

/** @test {empty} */
describe('Observable.empty', () => {
  asDiagram('empty')('should create a cold observable with only complete', () => {
    const expected = '|';
    const e1 = Observable.empty();
    expectObservable(e1).toBe(expected);
  });
});
