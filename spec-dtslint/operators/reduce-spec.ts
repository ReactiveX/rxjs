import { of, Observable } from 'rxjs';
import { reduce } from 'rxjs/operators';

it('should enforce parameter', () => {
  const a = of(1, 2, 3).pipe(reduce()); // $ExpectError
});

it('should infer correctly ', () => {
  const a = of(1, 2, 3).pipe(reduce((x, y, z) => x + 1)); // $ExpectType Observable<number>
});

it('should infer correctly for accumulator of type array', () => {
  const a = of(1, 2, 3).pipe(reduce((x: number[], y: number, i: number) => x, [])); // $ExpectType Observable<number[]>
});

it('should accept seed parameter of the same type', () => {
  const a = of(1, 2, 3).pipe(reduce((x, y, z) => x + 1, 5)); // $ExpectType Observable<number>
  const b = of(1, 2, 3).pipe(reduce((x, y, z) => x + 1, '5')); // $ExpectError
});
