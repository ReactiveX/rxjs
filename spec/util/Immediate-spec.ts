import { expect } from 'chai';
import { Immediate } from 'rxjs/util/Immediate';

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
});
