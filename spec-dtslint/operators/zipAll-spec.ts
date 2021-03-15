import { of } from 'rxjs';
import { zipAll } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(of(1, 2, 3)).pipe(zipAll()); // $ExpectType Observable<number[]>
});

it('should support projecting values', () => {
  const o = of(of(1, 2, 3)).pipe(zipAll(value => String(value))); // $ExpectType Observable<string>
});

it('should be accept projectors for observables with different types', () => {
  // An `any` signature is required for the projector to deal with situations
  // like this in which the source emits observables of different types. The
  // types of the values passed to the projector depend on the order in which
  // the source emits its observables and that can't be expressed in the type
  // system.
  const o = of(of(['a', 'b', 'c']), of([1, 2, 3])).pipe(zipAll((a: string, b: number) => a + b)); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(zipAll()); // $ExpectError
});

it('should enforce projector types', () => {
  const o = of(of(1, 2, 3)).pipe(zipAll('foo')); // $ExpectError
  const p = of(of(1, 2, 3)).pipe(zipAll([4, 5, 6])); // $ExpectError
  const q = of(of(1, 2, 3)).pipe(zipAll(Promise.resolve(4))); // $ExpectError
  const r = of(of(1, 2, 3)).pipe(zipAll(of(4, 5, 6))); // $ExpectError

  const myIterator: Iterator<number | undefined> = {
    next(value) {
      return {done: false, value};
    },
  };
  const s = of(of(1, 2, 3)).pipe(zipAll(myIterator)); // $ExpectError
});

it('should still zip Observable<string>, because strings are iterables (GOTCHA)', () => {
  const o = of('test').pipe(zipAll()); // $ExpectType Observable<string[]>
});
