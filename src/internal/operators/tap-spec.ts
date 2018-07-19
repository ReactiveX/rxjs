import { of } from 'rxjs/internal/create/of';
import { tap } from 'rxjs/internal/operators/tap';
import { expect } from 'chai';

describe('tap', () => {
  describe('with observer', () => {
    it('should work', () => {
      const observer = {
        results: [] as any[],
        next (value: any) { this.results.push(value); },
        error(err: any) { this.results.push(err); },
        complete() { this.results.push('done'); },
      };

      of(1, 2, 3).pipe(
        tap(observer),
      ).subscribe();

      expect(observer.results).to.deep.equal([1, 2, 3, 'done']);
    });

    it('accepts partial observers', () => {
      const observer = {
        results: [] as any[],
        next(value: any) { this.results.push(value); },
      };

      of(1, 2, 3).pipe(
        tap(observer),
      ).subscribe();

      expect(observer.results).to.deep.equal([1, 2, 3]);
    });
  });

  describe('with handlers', () => {
    it('should work', () => {
      const results: any[] = [];

      of(1, 2, 3).pipe(
        tap(
          (value: any) => results.push(value),
          (err: any) => results.push(err),
          () => results.push('done'),
        ),
      ).subscribe();

      expect(results).to.deep.equal([1, 2, 3, 'done']);
    });
  });
});
