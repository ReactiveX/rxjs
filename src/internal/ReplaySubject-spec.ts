import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { expect } from 'chai';

describe('ReplaySubject', () => {
  it('should replay values and completions', () => {
    const results: any[] = [];
    const s = new ReplaySubject();

    s.next(1);
    s.next(2);
    s.next(3);
    s.complete();
    s.next(4);

    s.subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 'done']);
  });

  it('should replay values and errors', () => {
    const results: any[] = [];
    let error: Error;
    const s = new ReplaySubject();

    s.next(1);
    s.next(2);
    s.next(3);
    s.error(new Error('bad'));
    s.next(4);

    s.subscribe({
      next(value) { results.push(value); },
      error(err) { error = err; },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3]);
    expect(error).to.be.an.instanceOf(Error);
    expect(error.message).to.equal('bad');
  });

  // TODO: add zone.js based tests for this.
});
