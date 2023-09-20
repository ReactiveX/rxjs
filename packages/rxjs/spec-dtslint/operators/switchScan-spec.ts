import { of } from 'rxjs';
import { switchScan } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(switchScan((acc: boolean, v: number) => of(Boolean(v)), false)); // $ExpectType Observable<boolean>
});

it('should infer correctly when using a single type', () => {
  const o = of(1, 2, 3).pipe(switchScan((acc, v) => of(acc + v), 0)); // $ExpectType Observable<number>
});

it('should infer correctly when using seed of a different type', () => {
  const o = of(1, 2, 3).pipe(switchScan((acc, v) => of(acc + v), '0')); // $ExpectType Observable<string>
});

it('should support a projector that takes an index', () => {
  const o = of(1, 2, 3).pipe(switchScan((acc, v, index) => of(Boolean(v)), false)); // $ExpectType Observable<boolean>
});

it('should support projecting to union types', () => {
  const o = of(Math.random()).pipe(switchScan(n => n > 0.5 ? of(123) : of('test'), 0)); // $ExpectType Observable<string | number>
});

it('should use the inferred accumulator return type over the seed type', () => {
  const o = of(1, 2, 3).pipe(switchScan(p => of(1), [])); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(switchScan()); // $ExpectError
});

it('should enforce the return type to be Observable', () => {
  const o = of(1, 2, 3).pipe(switchScan(p => p)); // $ExpectError
});

it('should enforce seed and accumulator to have the same type', () => {
  const o = of(1, 2, 3).pipe(switchScan((acc, p) => of([...acc, p]))); // $ExpectError
});
