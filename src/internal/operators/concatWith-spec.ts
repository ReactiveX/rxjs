import { concatWith } from 'rxjs/operators';
import { expect } from 'chai';
import { of } from 'rxjs';

describe('concatWith', () => {
  it('should concat other sources onto the end', () => {
    const results: any[] = [];
    of(1, 2, 3)
    .pipe(concatWith(
      of(4, 5, 6),
      of(7, 8, 9),
    ))
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 'done']);
  });
});
