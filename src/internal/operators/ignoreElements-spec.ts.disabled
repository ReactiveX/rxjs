import { of } from 'rxjs';
import { ignoreElements } from 'rxjs/operators';
import { expect } from 'chai';

describe('ignoreElements', () => {
  it('should ignore nexted values', () => {
    const source = of(1, 2, 3).pipe(
      ignoreElements()
    );

    const results: any[] = [];

    source.subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal(['done']);
  });
});
