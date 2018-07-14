import { min } from 'rxjs/operators';
import { expect } from 'chai';
import { of } from 'rxjs';

describe('min', () => {
  it('should get the maximum of the emitted values', () => {
    const results: any[] = [];

    of(5, 10, 3, 12, 7)
    .pipe(min())
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([3, 'done']);
  });

  it('should get the maximum of the emitted values, given a comparer', () => {

    const results: any[] = [];

    of(
      { name: 'a', value: 5 },
      { name: 'b', value: 12 },
      { name: 'c', value: 3 },
      { name: 'd', value: 42 },
      { name: 'e', value: 7 },
    )
    .pipe(min((a, b) => a.value === b.value ? 0 : (a.value > b.value ? 1 : -1)))
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([{ name: 'c', value: 3 }, 'done']);
  });
});
