import { of, merge } from 'rxjs';
import { expect } from 'chai';

// TODO: write a zone.js test to cover this with a timer
describe('merge', () => {
  it('should merge multiple observables', () => {
    const results: any[] = [];

    const s1 = of(1);
    const s2 = of(2);
    const s3 = of(3);

    merge(s1, s2, s3).subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 'done']);
  });
});
