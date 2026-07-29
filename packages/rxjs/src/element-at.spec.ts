import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { elementAt } from './element-at.js';

describe('elementAt', () => {
  it('emits a supplied default when the source completes before the index', () => {
    const results: (number | string)[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.complete();
    });

    source[elementAt](2, 'default').subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual(['default', 'complete']);
  });

  it('distinguishes an explicit undefined default from an omitted default', () => {
    const explicitDefaultResults: (number | undefined | 'complete')[] = [];
    const omittedDefaultResults: (number | 'complete')[] = [];
    const source = new Observable<number>((subscriber) => subscriber.complete());

    source[elementAt](0, undefined).subscribe({
      next: (value) => explicitDefaultResults.push(value),
      complete: () => explicitDefaultResults.push('complete'),
    });
    source[elementAt](0).subscribe({
      next: (value) => omittedDefaultResults.push(value),
      complete: () => omittedDefaultResults.push('complete'),
    });

    expect(explicitDefaultResults).toEqual([undefined, 'complete']);
    expect(omittedDefaultResults).toEqual(['complete']);
  });
});
