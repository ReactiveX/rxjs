import { of, Observable, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { count, buffer } from 'rxjs/operators';

it('should always infer number', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(count(x => x > 1)));
  expectType<Observable<number>>(of('a', 'b', 'c').pipe(count(x => x === 'a')));
});

it('should accept empty parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(count()));
});

it('should infer source observable type in parameter', () => {
  expectError(of(1, 2, 3).pipe(count((x, i, source: Observable<string>) => x === 3)));
});

it('should enforce value type of source type', () => {
  expectError(of(1, 2, 3).pipe(count((x, i, source) => x === '3')));
});

it('should enforce index type of number', () => {
  expectError(of(1, 2, 3).pipe(count((x, i, source) => i === '3')));
});

it('should expect function parameter', () => {
  expectError(of(1, 2, 3).pipe(count(9)));
});

it('should enforce source type', () => {
  expectError(of(1, 2, 3).pipe(count(x => x === '')));
});
