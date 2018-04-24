import { Subject } from './Subject';
import { expect } from 'chai';

describe('Subject', () => {
  it('should do subject things', () => {
    const results1: any[] = [];
    const results2: any[] = [];
    const s = new Subject();

    s.subscribe({
      next(value) { results1.push(value); },
      complete() { results1.push('done') },
    });

    expect(results1).to.deep.equal([]);

    s.next(1);
    s.next(2);

    s.subscribe({
      next(value) { results2.push(value); },
      complete() { results2.push('done') },
    });

    expect(results2).to.deep.equal([]);

    s.next(3);
    s.complete();
    s.next(4);

    expect(results1).to.deep.equal([1, 2, 3, 'done']);
    expect(results2).to.deep.equal([3, 'done']);
  });

  it('should emit the error if subscribed to after an error', () => {
    const s = new Subject();
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
