import { of, concat } from 'rxjs';
import { expect } from 'chai';

// TODO: write a zone.js test to cover this with a timer
describe('concat', () => {
  it('should play multiple observables back to back, one at a time', () => {
    const results: any[] = [];

    const s1 = of(1);
    const s2 = of(2);
    const s3 = of(3);

    concat(s1, s2, s3).subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 'done']);
  });
});
