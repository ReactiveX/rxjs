import { expect } from 'chai';
import { of } from '../create/of';
import { takeLast } from './takeLast';

describe('takeLast', () => {
  it('should take the last n values when the observable completes', () => {
    const results: any[] = [];
    of(1, 2, 3, 4, 5, 6, 7).pipe(
      takeLast(4),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([4, 5, 6, 7, 'done']);
  });

  it('should default to just taking the very last value', () => {
    const results: any[] = [];
    of(1, 2, 3, 4, 5, 6, 7).pipe(
      takeLast(),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([7, 'done']);
  });

  // TODO: This really needs a marbles test
  it.only('should wait and complete for counts less than one', () => {
    const results: any[] = [];
    of(1, 2, 3, 4, 5, 6, 7).pipe(
      takeLast(-1),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal(['done']);
  });
});
