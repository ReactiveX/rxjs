import { startWith } from 'rxjs/operators';
import { expect } from 'chai';
import { of } from 'rxjs';

describe('startWith', () => {
  it('should concat other sources onto the end', () => {
    const results: any[] = [];

    of(3, 4, 5)
    .pipe(startWith(1, 2))
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 4, 5, 'done']);
  });
});
