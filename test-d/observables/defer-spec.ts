import { of, defer, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

it('should enforce function parameter', () => {
  expectError(defer());
});

it('should infer correctly with function return observable', () => {
  expectType<Observable<number>>(defer(() => of(1, 2, 3)));
});

it('should infer correctly with function return promise', () => {
  expectType<Observable<number>>(defer(() => Promise.resolve(5)));
});

it('should support union type returns', () => {
  expectType<Observable<string | number>>(defer(() => Math.random() > 0.5 ? of(123) : of('abc')));
});

it('should infer correctly with void functions', () => {
  expectType<Observable<never>>(defer(() => {}));
});

it('should error if an ObservableInput is not returned', () => {
  expectError(defer(() => 42));
});

it('should infer correctly with functions that sometimes do not return an ObservableInput', () => {
  expectType<Observable<number>>(defer(() => { if (Math.random() < 0.5) { return of(42); } }));
});
