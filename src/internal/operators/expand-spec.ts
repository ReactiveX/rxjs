import { expand, map } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';
import { expect } from 'chai';

describe('expand', () => {
  it('should recursively flatten', () => {
    const results: any[] = [];

    of(1, 2).pipe(
      expand((v, i) => {
        if (i >= 3) return EMPTY;
        return of(1, 2, 3).pipe(
          map(w => v + '-' + w),
        );
      }),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([
      1,
      '1-1',
      '1-1-1',
      '1-1-1-1',
      '1-1-1-2',
      '1-1-1-3',
      '1-1-2',
      '1-1-3',
      '1-2',
      '1-3',
      2,
      'done'
    ]);
  });
});
