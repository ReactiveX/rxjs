import { of } from 'rxjs';
import { combineAll } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of([1, 2, 3]).pipe(combineAll()); // $ExpectType Observable<number[]>
});

it('should infer correctly with the projector', () => {
  const o = of([1, 2, 3]).pipe(combineAll((values: number) => ['x', 'y', 'z'])); // $ExpectType Observable<string[]>
});

it('is possible to make the projector have an `any` type', () => {
  const o = of([1, 2, 3]).pipe(combineAll<string[]>(values => ['x', 'y', 'z'])); // $ExpectType Observable<string[]>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(combineAll()); // $ExpectError
});

it('should enforce type of the projector', () => {
  const o = of([1, 2, 3]).pipe(combineAll((values: string) => ['x', 'y', 'z'])); // $ExpectError
  const p = of([1, 2, 3]).pipe(combineAll<number[]>(values => ['x', 'y', 'z'])); // $ExpectError
});
