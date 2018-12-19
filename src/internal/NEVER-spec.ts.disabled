import { NEVER } from 'rxjs';
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from './test_helpers/assertDeepEquals';

/** @test {NEVER} */
describe('NEVER', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('NEVER')
  it('should create a cold observable that never emits', () => {
    testScheduler.run(({ expectObservable }) => {
      const expected = '-';
      const e1 = NEVER;
      expectObservable(e1).toBe(expected);
    });
  });

  it('should return the same instance every time', () => {
    expect(NEVER).to.equal(NEVER);
  });
});
