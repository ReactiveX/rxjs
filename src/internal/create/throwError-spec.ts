
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { throwError } from 'rxjs';
import { assertDeepEquals } from '../test_helpers/assertDeepEquals';

/** @test {throw} */
describe('throwError', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  // asDiagram('throw(e)')
  it('should create a cold observable that just emits an error', () => {
    testScheduler.run(({ expectObservable }) => {
      const expected = '#';
      const e1 = throwError('error');
      expectObservable(e1).toBe(expected);
    });
  });

  it('should emit one value', done => {
    let calls = 0;
    throwError('bad').subscribe(() => {
      done(new Error('should not be called'));
    }, (err) => {
      expect(++calls).to.equal(1);
      expect(err).to.equal('bad');
      done();
    });
  });
});
