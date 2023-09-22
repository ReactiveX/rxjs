import { of } from 'rxjs';
import { concatMapTo } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(of('foo'))); // $ExpectType Observable<string>
});

it('should infer correctly with multiple types', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(of('foo', 4))); // $ExpectType Observable<string | number>
});

it('should infer correctly with an array', () => {
  const o = of(1, 2, 3).pipe(concatMapTo([4, 5, 6])); // $ExpectType Observable<number>
});

it('should infer correctly with a Promise', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(new Promise<string>(() => {}))); // $ExpectType Observable<string>
});

it('should support union types', () => {
  const s = Math.random() > 0.5 ? of(123) : of('abc');
  const r = of(1, 2, 3).pipe(concatMapTo(s)); // $ExpectType Observable<string | number>
});

it('should support union-type projections with empty streams', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(Math.random() < 0.5 ? of(123) : of())); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(concatMapTo()); // $ExpectError
});

it('should enforce types of the observable parameter', () => {
  const fn = () => {}
  const o = of(1, 2, 3).pipe(concatMapTo(fn)); // $ExpectError
});

it('should enforce the return type', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(p => p)); // $ExpectError
  const p = of(1, 2, 3).pipe(concatMapTo(4)); // $ExpectError
});

it('should produce `Observable<never>` when mapping to an `ObservableInput<never>`', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(Promise.reject())); // $ExpectType Observable<never>
});

it('should be deprecated', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(of(true))); // $ExpectDeprecation
});
