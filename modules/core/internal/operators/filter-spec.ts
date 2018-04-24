import { of } from '../create/of';
import { filter } from './filter';
import { expect } from 'chai';

describe('filter', () => {
  it('should filter values by a predicate', () => {
    const results: any[] = [];

    of(1, 2, 3, 4).pipe(
      filter(x => x !== 2),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 3, 4, 'done']);
  });

  it('should propagate errors thrown in the predicate', () => {
    const results: any[] = [];
    let error: Error;

    of(1, 2, 3, 4).pipe(
      filter(x => {
        if (x === 3) throw new Error('Threes Company');
        return true;
      }),
    )
    .subscribe({
      next(value) { results.push(value); },
      error(err) { error = err; },
      complete() { throw new Error('should not be called'); },
    });

    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.equal('Threes Company');
    expect(results).to.deep.equal([1, 2]);
  });
});
