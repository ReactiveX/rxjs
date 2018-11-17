import { of } from 'rxjs';
import { scan } from 'rxjs/operators';

it('should enforce accumulator function as parameter', () => {
  const a = of(1, 2, 3).pipe(scan()); // $ExpectError
});

it('should infer correctly with single T value', () => {
  const a = of(1, 2, 3).pipe(scan((acc, val, i) => acc + val)); // $ExpectType Observable<number>
});

it('should do a type check on seed parameter', () => {
  const b = of(1, 2, 3).pipe(scan((acc, val, i) => acc + val, 0)); // $ExpectType Observable<number>
  const a = of(1, 2, 3).pipe(scan((acc, val, i) => acc + val, 'y')); // $ExpectError
});

it('should infer correctly with Array of T value', () => {
  const a = of(1, 2, 3).pipe(scan((acc: number[], val: number, i) => [...acc, val])); // $ExpectType Observable<number[]>
});

it('should infer correctly with type change accumulator', () => {
  const a = of(1, 2, 3).pipe(scan((acc: string, val: number, i) => `${acc} ' ' ${val}`)); // $ $expectType Observable<string>
});
