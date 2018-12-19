import { of } from 'rxjs/internal/create/of';
import { skip } from 'rxjs/operators';
import { expect } from 'chai';

describe('skip', () => {
  it('should skip a few values', () => {
    const source = of(1, 2, 3, 4, 5).pipe(
      skip(2),
    );

    const results: any[] = [];

    source.subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([3, 4, 5, 'done']);
  });
});
