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
  const o = of(of(1, 2, 3)).pipe(zipAll('foo')); // $ExpectError
  const p = of(of(1, 2, 3)).pipe(zipAll([4, 5, 6])); // $ExpectError
  const q = of(of(1, 2, 3)).pipe(zipAll(Promise.resolve(4))); // $ExpectError
  const r = of(of(1, 2, 3)).pipe(zipAll(of(4, 5, 6))); // $ExpectError

  const myIterator: Iterator<number> = {
    next(value: number) {
      return {done: false, value};
    },
  };
  const s = of(of(1, 2, 3)).pipe(zipAll(myIterator)); // $ExpectError
});

it('should still zip Observable<string>, because strings are iterables (GOTCHA)', () => {
  const o = of('test').pipe(zipAll()); // $ExpectType Observable<string[]>
});
