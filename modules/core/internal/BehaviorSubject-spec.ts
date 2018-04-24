import { BehaviorSubject } from "./BehaviorSubject";
import { expect } from 'chai';

describe('BehaviorSubject', () => {
  it('should emit the initial value, then behave like a Subject', () => {
    const results: any[] = [];
    const bs = new BehaviorSubject(0);

    bs.subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([0]);

    bs.next(1);
    bs.next(2);
    bs.complete();
    bs.next(3);

    expect(results).to.deep.equal([0, 1, 2, 'done']);
  });

  it('should emit the error if subscribed to after an error', () => {
    const s = new BehaviorSubject(0);
    s.error(new Error('bad'));

    let error: any;
    s.subscribe({
      error(err) {
        error = err;
      }
    });

    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.equal('bad');
  });
});
