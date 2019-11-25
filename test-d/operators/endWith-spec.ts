import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { endWith } from 'rxjs/operators';

it('should support a scheduler', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(endWith(asyncScheduler)));
});

it('should infer type for 1 parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(endWith(4)));
});

it('should infer type for 2 parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(endWith(4, 5)));
});

it('should infer type for 3 parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(endWith(4, 5, 6)));
});

it('should infer type for 4 parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(endWith(4, 5, 6, 7)));
});

it('should infer type for 5 parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(endWith(4, 5, 6, 7, 8)));
});

it('should infer type for 6 parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(endWith(4, 5, 6, 7, 8, 9)));
});

it('should infer type for rest parameters', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(endWith(4, 5, 6, 7, 8, 9, 10)));
});

it('should infer with different types', () => {
  expectType<Observable<string | number | boolean>>(of(1, 2, 3).pipe(endWith('4', true)));
});

it('should accept empty parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(endWith()));
});
