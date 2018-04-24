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
});
