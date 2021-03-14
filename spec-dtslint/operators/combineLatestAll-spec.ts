import { of } from 'rxjs';
import { combineLatestAll } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of([1, 2, 3]).pipe(combineLatestAll()); // $ExpectType Observable<number[]>
});

it('should infer correctly with the projector', () => {
  const o = of([1, 2, 3]).pipe(combineLatestAll((values: number) => ['x', 'y', 'z'])); // $ExpectType Observable<string[]>
});

it('should be accept projectors for observables with different types', () => {
  // An `any` signature is required for the projector to deal with situations
  // like this in which the source emits observables of different types. The
  // types of the values passed to the projector depend on the order in which
  // the source emits its observables and that can't be expressed in the type
  // system.
  const o = of(of(['a', 'b', 'c']), of([1, 2, 3])).pipe(combineLatestAll((a: string, b: number) => a + b)); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(combineLatestAll()); // $ExpectError
});

it('should enforce type of the projector', () => {
  const o = of([1, 2, 3]).pipe(combineLatestAll((values: string) => ['x', 'y', 'z'])); // $ExpectError
  const p = of([1, 2, 3]).pipe(combineLatestAll<number[]>(values => ['x', 'y', 'z'])); // $ExpectError
});
