import * as Rx from '../../dist/cjs/Rx';
declare const {hot, asDiagram, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;

/** @test {never} */
describe('Observable.never', () => {
  asDiagram('never')('should create a cold observable that never emits', () => {
    const expected = '-';
    const e1 = Observable.never();
    expectObservable(e1).toBe(expected);
  });
});
