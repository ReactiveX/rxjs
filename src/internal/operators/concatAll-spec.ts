import { concatAll } from 'rxjs/operators';
import { expect } from 'chai';
import { of } from 'rxjs';

describe('concatAll', () => {
  it('should merge all inner observables from a source Observable<Observable<T>>', () => {
    const results: any[] = [];
    of(
      of(1, 2, 3),
      of(4, 5, 6),
      of(7, 8, 9)
    )
    .pipe(concatAll())
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 'done']);
  });
});
