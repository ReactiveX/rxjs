import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { defaultIfEmpty, map } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(defaultIfEmpty()));
});

it('should infer correctly with a defaultValue', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(defaultIfEmpty(47)));
});

it('should infer correctly with a different type of defaultValue', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(defaultIfEmpty<number, string>('carbonara')));
});

it('should infer correctly with a subtype passed through parameters', () => {
  expectType<Observable<boolean>>(of(true, false).pipe(map(p => p), defaultIfEmpty(true)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(defaultIfEmpty(4, 5)));
});
