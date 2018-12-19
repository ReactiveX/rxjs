import { count } from 'rxjs/operators';
import { expect } from 'chai';
import { of } from 'rxjs';

describe('count', () => {
  it('should count the emitted values', () => {
    const results: any[] = [];

    of(1, 2, 3)
    .pipe(count())
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([3, 'done']);
  });

  it('should count the values that pass the predicate', () => {

    const results: any[] = [];

    const isEven = (x: number) => x % 2 === 0;

    of(1, 2, 3, 4, 5)
    .pipe(count(isEven))
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([2, 'done']);
  });
});
