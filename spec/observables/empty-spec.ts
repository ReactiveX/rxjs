import * as Rx from '../../dist/cjs/Rx';
declare const {hot, asDiagram, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;

/** @test {empty} */
describe('Observable.empty', () => {
  asDiagram('empty')('should create a cold observable with only complete', () => {
    const expected = '|';
    const e1 = Observable.empty();
    expectObservable(e1).toBe(expected);
  });
});
