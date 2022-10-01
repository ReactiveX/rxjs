import { expect } from 'chai';
// TODO: import was changed due to the fact that at startup the test referred to rxjs from node_modules
import { Immediate, TestTools } from '../../src/internal/util/Immediate';

describe('Immediate', () => {
  it('should schedule on the next microtask', (done) => {
    const results: number[] = [];
    results.push(1);
    setTimeout(() => results.push(5));
    Immediate.setImmediate(() => results.push(3));
    results.push(2);
    Promise.resolve().then(() => results.push(4));

    setTimeout(() => {
      expect(results).to.deep.equal([1, 2, 3, 4, 5]);
      done();
    });
  });

  it('should cancel the task with clearImmediate', (done) => {
    const results: number[] = [];
    results.push(1);
    setTimeout(() => results.push(5));
    const handle = Immediate.setImmediate(() => results.push(3));
    Immediate.clearImmediate(handle);
    results.push(2);
    Promise.resolve().then(() => results.push(4));

    setTimeout(() => {
      expect(results).to.deep.equal([1, 2, 4, 5]);
      done();
    });
  });

  it('should clear the task after execution', (done) => {
    const results: number[] = [];
    Immediate.setImmediate(() => results.push(1));
    Immediate.setImmediate(() => results.push(2));

    setTimeout(() => {
      const number = TestTools.pending();
      expect(number).to.equal(0);
      done();
    });
  });
});
