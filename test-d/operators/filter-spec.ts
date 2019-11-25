import { Observable, of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { filter, map } from 'rxjs/operators';

it('should support a predicate', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(filter(value => value < 3)));
});

it('should support a predicate with an index', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(filter((value, index) => index < 3)));
});

it('should support a predicate and an argument', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(filter(value => value < 3, 'bonjour')));
});

it('should support a user-defined type guard', () => {
  expectType<Observable<1>>(of(1, 2, 3).pipe(filter((value: number): value is 1 => value < 3)));
});

it('should support a user-defined type guard with an index', () => {
  expectType<Observable<1>>(of(1, 2, 3).pipe(filter((value: number, index): value is 1 => index < 3)));
});

it('should support a user-defined type guard and an argument', () => {
  expectType<Observable<1>>(of(1, 2, 3).pipe(filter((value: number): value is 1 => value < 3, 'hola')));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(filter()));
});

it('should enforce predicate types', () => {
  expectError(of(1, 2, 3).pipe(filter(value => value < '3')));
  expectError(of(1, 2, 3).pipe(filter((value, index) => index < '3')));
});

it('should enforce user-defined type guard types', () => {
  expectError(of(1, 2, 3).pipe(filter((value: string): value is '1' => value < '3')));
  expectError(of(1, 2, 3).pipe(filter((value: number, index): value is 1 => index < '3')));
});

it('should support Boolean as a predicate', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(filter(Boolean)));
  expectType<Observable<number>>(of(1, null, undefined).pipe(filter(Boolean)));
  expectType<Observable<never>>(of(null, undefined).pipe(filter(Boolean)));
});

// I've not been able to effect a failing dtslint test for this situation and a
// conventional test won't fail because the TypeScript configuration isn't
// sufficiently strict:
// https://github.com/ReactiveX/rxjs/issues/4959#issuecomment-520629091
it('should support inference from a return type with Boolean as a predicate', () => {
  interface I {
    a: string | null;
  }

  const i$: Observable<I> = of();
  expectType<Observable<string>>(i$.pipe(map(i => i.a), filter(Boolean)));
});

it('should support inference from a generic return type of the predicate', () => {
  function isDefined<T>() {
    return (value: T|undefined|null): value is T => {
      return value !== undefined && value !== null;
    };
  }

  expectType<Observable<string | number | boolean | { foo: string; }>>(of(1, null, {foo: 'bar'}, true, undefined, 'Nick Cage').pipe(filter(isDefined())));
});
