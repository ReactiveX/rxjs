import { of, defer } from 'rxjs';

it('should enforce function parameter', () => {
  const a = defer(); // $ExpectError
});

it('should infer correctly with function return observable', () => {
  const a = defer(() => of(1, 2, 3)); // $ExpectType Observable<number>
});

it('should infer correctly with function return promise', () => {
  const a = defer(() => Promise.resolve(5)); // $ExpectType Observable<number>
});

it('should support union type returns', () => {
  const a = defer(() => Math.random() > 0.5 ? of(123) : of('abc')); // $ExpectType Observable<string | number>
});

it('should infer correctly with void functions', () => {
  const a = defer(() => {}); // $ExpectType Observable<never>
});

it('should error if an ObservableInput is not returned', () => {
  const a = defer(() => 42); // $ExpectError
});

it('should infer correctly with functions that sometimes do not return an ObservableInput', () => {
  const a = defer(() => { if (Math.random() < 0.5) { return of(42); } }); // $ExpectType Observable<number>
});
