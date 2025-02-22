import { describe, it, expect } from 'vitest';
import '@rxjs/observable-polyfill';
import { scan } from './scan.js';

describe('scan', () => {
  it('should accumulate values', () => {
    const results: (string | number)[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });

    source[scan]((acc, value) => acc + value, 0).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([1, 3, 6, 'complete']);
  });
});
