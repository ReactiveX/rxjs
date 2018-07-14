import { of } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { expect } from 'chai';

describe('takeWhile', () => {
  it('should takeWhile a few and complete', () => {
    const results: any[] = [];

    of(1, 2, 3, 4, 5, 6).pipe(
      takeWhile(x => x < 4),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); }
    });

    expect(results).to.deep.equal([1, 2, 3, 'done']);
  });
});
