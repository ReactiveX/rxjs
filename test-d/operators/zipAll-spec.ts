import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { zipAll } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number[]>>(of(of(1, 2, 3)).pipe(zipAll()));
});

it('should support projecting values', () => {
  expectType<Observable<string>>(of(of(1, 2, 3)).pipe(zipAll(value => String(value))));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(zipAll()));
});

it('should enforce projector types', () => {
  expectError(of(of(1, 2, 3)).pipe(zipAll('foo')));
  expectError(of(of(1, 2, 3)).pipe(zipAll([4, 5, 6])));
  expectError(of(of(1, 2, 3)).pipe(zipAll(Promise.resolve(4))));
  expectError(of(of(1, 2, 3)).pipe(zipAll(of(4, 5, 6))));

  const myIterator: Iterator<number | undefined> = {
    next(value) {
      return {done: false, value};
    },
  };
  expectError(of(of(1, 2, 3)).pipe(zipAll(myIterator)));
});

it('should still zip Observable<string>, because strings are iterables (GOTCHA)', () => {
  expectType<Observable<string[]>>(of('test').pipe(zipAll()));
});
