import { of } from 'rxjs';
import { switchScan } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(switchScan((acc: boolean, v: number) => of(Boolean(v)), false)); // $ExpectType Observable<boolean>
});

it('should infer correctly when using a single type', () => {
  const o = of(1, 2, 3).pipe(switchScan((acc, v) => of(acc + v), 0)); // $ExpectType Observable<number>
});

it('should infer correctly when using a seed', () => {
  const o = of(1, 2, 3).pipe(switchScan((acc, v) => of(acc + v), 0)); // $ExpectType Observable<number>
});

it('should infer correctly when using seed of a different type', () => {
  const o = of(1, 2, 3).pipe(switchScan((acc: string, v: number) => of(acc + v), '0')); // $ExpectType Observable<string>
});

it('should support a projector that takes an index', () => {
  const o = of(1, 2, 3).pipe(switchScan((acc: boolean, v: number, index: number) => of(Boolean(v)), false)); // $ExpectType Observable<boolean>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(switchScan()); // $ExpectError
});

it('should enforce the return type to be Observable', () => {
  const o = of(1, 2, 3).pipe(switchScan(p => p)); // $ExpectError
});

it('should enforce seed and the return type from accumulator', () => {
  const o = of(1, 2, 3).pipe(switchScan(p => of(1), [])); // $ExpectError
});

it('should enforce seed and accumulator to have the same type', () => {
  const o = of(1, 2, 3).pipe(switchScan((acc, p) => of([...acc, p]))); // $ExpectError
});
