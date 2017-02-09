import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const expectObservable: typeof marbleTestingSignature.expectObservable;

const Observable = Rx.Observable;

/** @test {never} */
describe('Observable.never', () => {
  asDiagram('never')('should create a cold observable that never emits', () => {
    const expected = '-';
    const e1 = Observable.never();
    expectObservable(e1).toBe(expected);
  });
});
