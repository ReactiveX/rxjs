import { of } from 'rxjs';
import { zipAll } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(of(1, 2, 3)).pipe(zipAll()); // $ExpectType Observable<number[]>
});

it('should support projecting values', () => {
  const o = of(of(1, 2, 3)).pipe(zipAll(value => String(value))); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(zipAll()); // $ExpectError
});

it('should enforce projector types', () => {
  const o = of(of(1, 2, 3)).pipe(zipAll('')); // $ExpectError
  const p = of(of(1, 2, 3)).pipe(zipAll((value: string) => value)); // $ExpectError
  const q = of(of(1, 2, 3)).pipe(zipAll<string>()); // $ExpectError
});

it('should still zip Observable<string>, because strings are iterables (GOTCHA)', () => {
  const o = of('test').pipe(zipAll()); // $ExpectType Observable<string[]>
});
