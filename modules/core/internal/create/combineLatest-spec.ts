import { of } from "./of";
import { combineLatest } from "./combineLatest";

// TODO: write a zone.js test to cover this with a timer
describe('combineLatest', () => {
  it('should combine the latest values of multiple observables', () => {
    const results: any[] = [];

    const s1 = of(1);
    const s2 = of(2);
    const s3 = of(3);

    combineLatest(s1, s2, s3).subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });
  });
});
