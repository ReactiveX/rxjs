import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { pairs } from 'rxjs';
import { assertDeepEquals } from '../test_helpers/assertDeepEquals';

describe('pairs', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('pairs({a: 1, b:2})')
  it('should create an observable emits key-value pair', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = pairs({a: 1, b: 2});
      const expected = '(ab|)';
      const values = {
        a: ['a', 1],
        b: ['b', 2]
      };

      expectObservable(e1).toBe(expected, values);
    });
  });

  it('should create an observable without scheduler', (done: MochaDone) => {
    let expected = [
      ['a', 1],
      ['b', 2],
      ['c', 3]
    ];

    pairs({a: 1, b: 2, c: 3}).subscribe(x => {
      expect(x).to.deep.equal(expected.shift());
    }, x => {
      done(new Error('should not be called'));
    }, () => {
      expect(expected).to.be.empty;
      done();
    });
  });

  it('should work with empty object', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = pairs({});
      const expected = '|';

      expectObservable(e1).toBe(expected);
    });
  });
});
