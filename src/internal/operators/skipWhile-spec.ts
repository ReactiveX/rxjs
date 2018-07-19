import { of } from 'rxjs/internal/create/of';
import { skipWhile } from 'rxjs/operators';
import { expect } from 'chai';

describe('skipWhile', () => {
  it('should skipWhile a few values', () => {
    const source = of(1, 2, 3, 4, 5, 2, 1).pipe(
      skipWhile(x => x < 4),
    );

    const results: any[] = [];

    source.subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([4, 5, 2, 1, 'done']);
  });
});
