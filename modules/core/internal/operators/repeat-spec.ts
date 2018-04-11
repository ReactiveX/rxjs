import { of } from '../create/of';
import { repeat } from './repeat';
import { expect } from 'chai';

describe('repeat', () => {
  it('should repeat and complete', () => {
    const results: any[] = [];

    of(1, 2).pipe(
      repeat(3),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); }
    });

    expect(results).to.deep.equal([1, 2, 1, 2, 1, 2, 'done']);
  });
});
