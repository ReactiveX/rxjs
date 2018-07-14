import { endWith } from 'rxjs/operators';
import { expect } from 'chai';
import { of } from 'rxjs';

describe('endWith', () => {
  it('should concat other sources onto the end', () => {
    const results: any[] = [];

    of(1, 2, 3)
    .pipe(endWith(4, 5))
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 4, 5, 'done']);
  });
});
