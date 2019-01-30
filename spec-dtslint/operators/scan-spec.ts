import { of } from 'rxjs';
import { scan } from 'rxjs/operators';

it('should enforce parameter', () => {
  const a = of(1, 2, 3).pipe(scan()); // $ExpectError
});

it('should infer correctly ', () => {
  const a = of(1, 2, 3).pipe(scan((x, y, z) => x + 1)); // $ExpectType Observable<number>
});

it('should infer correctly for accumulator of type array', () => {
  const a = of(1, 2, 3).pipe(scan((x: number[], y: number, i: number) => x, [])); // $ExpectType Observable<number[]>
});

it('should accept seed parameter of the same type', () => {
  const a = of(1, 2, 3).pipe(scan((x, y, z) => x + 1, 5)); // $ExpectType Observable<number>
  const b = of(1, 2, 3).pipe(scan((x, y, z) => x + 1, '5')); // $ExpectError
});
