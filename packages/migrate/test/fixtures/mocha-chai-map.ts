import { expect } from 'chai';
import { map } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

describe('map', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => expect(actual).to.deep.equal(expected));
  });

  it('maps values', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const source = cold('-a-b-|', { a: 1, b: 2 });
      expectObservable(source.pipe(map((value) => value * 2))).toBe('-a-b-|', { a: 2, b: 4 });
    });
  });
});
