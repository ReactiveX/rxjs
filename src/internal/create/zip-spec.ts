import { of } from "./of";
import { zip } from "./zip";
import { expect } from "chai";

describe('zip', () => {
  it('should zip together multiple observables', () => {
    const s1 = of(1, 2, 3);
    const s2 = of(3, 4, 5);
    const s3 = of(6, 7, 8);

    const results: any[] = [];

    zip(s1, s2, s3).subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([
      [1, 3, 6],
      [2, 4, 7],
      [3, 5, 8],
      'done',
    ]);
  });

  it('should zip the maximum number it can zip, and complete early', () => {
    const s1 = of(1, 2, 3);
    const s2 = of(3, 4);
    const s3 = of(6, 7, 8);

    const results: any[] = [];

    zip(s1, s2, s3).subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([
      [1, 3, 6],
      [2, 4, 7],
      'done',
    ]);
  });
});
