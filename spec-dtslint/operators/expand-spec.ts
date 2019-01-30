import { of, asyncScheduler } from 'rxjs';
import { expand } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(expand(value => of(value))); // $ExpectType Observable<number>
  const p = of(1, 2, 3).pipe(expand(value => [value])); // $ExpectType Observable<number>
  const q = of(1, 2, 3).pipe(expand(value => Promise.resolve(value))); // $ExpectType Observable<number>
});

it('should infer correctly with a different type as the source', () => {
  const o = of(1, 2, 3).pipe(expand(value => of('foo'))); // $ExpectType Observable<string>
  const p = of(1, 2, 3).pipe(expand(value => ['foo'])); // $ExpectType Observable<string>
  const q = of(1, 2, 3).pipe(expand(value => Promise.resolve('foo'))); // $ExpectType Observable<string>
});

it('should support a project function with index', () => {
  const o = of(1, 2, 3).pipe(expand((value, index) => of(index))); // $ExpectType Observable<number>
});

it('should support concurrent parameter', () => {
  const o = of(1, 2, 3).pipe(expand(value => of(1), 47)); // $ExpectType Observable<number>
});

it('should support a scheduler', () => {
  const o = of(1, 2, 3).pipe(expand(value => of(1), 47, asyncScheduler)); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(expand()); // $ExpectError
});

it('should enforce project types', () => {
  const o = of(1, 2, 3).pipe(expand((value: string, index) => of(1))); // $ExpectError
  const p = of(1, 2, 3).pipe(expand((value, index: string) => of(1))); // $ExpectError
});

it('should enforce project return type', () => {
  const o = of(1, 2, 3).pipe(expand(value => 1)); // $ExpectError
});

it('should enforce concurrent type', () => {
  const o = of(1, 2, 3).pipe(expand(value => of(1), 'foo')); // $ExpectError
});

it('should enforce scheduler type', () => {
  const o = of(1, 2, 3).pipe(expand(value => of(1), 47, 'foo')); // $ExpectError
});

// TODO(benlesh): Fix this when TypeScript is capable of handling typing this.
// Currently we can't type this one properly because the projection function is
// recursively called with the values from the returned ObservableInput.
// it('should support union types', () => {
//   const o = of(1).pipe(expand(x => typeof x === 'string' ? of(123) : of('test'))); // $ExpectType Observable<string | number>
// });
