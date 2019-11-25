import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { combineAll } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number[]>>(of([1, 2, 3]).pipe(combineAll()));
});

it('should infer correctly with the projector', () => {
  expectType<Observable<string[]>>(of([1, 2, 3]).pipe(combineAll((values: number) => ['x', 'y', 'z'])));
});

it('is possible to make the projector have an `any` type', () => {
  expectType<Observable<string[]>>(of([1, 2, 3]).pipe(combineAll<string[]>(values => ['x', 'y', 'z'])));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(combineAll()));
});

it('should enforce type of the projector', () => {
  expectError(of([1, 2, 3]).pipe(combineAll((values: string) => ['x', 'y', 'z'])));
  expectError(of([1, 2, 3]).pipe(combineAll<number[]>(values => ['x', 'y', 'z'])));
});
