import { of } from 'rxjs';
import { filter } from 'rxjs/operators';

it('should support a predicate', () => {
  const o = of(1, 2, 3).pipe(filter(value => value < 3)); // $ExpectType Observable<number>
});

it('should support a predicate with an index', () => {
  const o = of(1, 2, 3).pipe(filter((value, index) => index < 3)); // $ExpectType Observable<number>
});

it('should support a predicate and an argument', () => {
  const o = of(1, 2, 3).pipe(filter(value => value < 3, 'bonjour')); // $ExpectType Observable<number>
});

it('should support a user-defined type guard', () => {
  const o = of(1, 2, 3).pipe(filter((value: number): value is 1 => value < 3)); // $ExpectType Observable<1>
});

it('should support a user-defined type guard with an index', () => {
  const o = of(1, 2, 3).pipe(filter((value: number, index): value is 1 => index < 3)); // $ExpectType Observable<1>
});

it('should support a user-defined type guard and an argument', () => {
  const o = of(1, 2, 3).pipe(filter((value: number): value is 1 => value < 3, 'hola')); // $ExpectType Observable<1>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(filter()); // $ExpectError
});

it('should enforce predicate types', () => {
  const o = of(1, 2, 3).pipe(filter(value => value < '3')); // $ExpectError
  const p = of(1, 2, 3).pipe(filter((value, index) => index < '3')); // $ExpectError
});

it('should enforce user-defined type guard types', () => {
  const o = of(1, 2, 3).pipe(filter((value: string): value is '1' => value < '3')); // $ExpectError
  const p = of(1, 2, 3).pipe(filter((value: number, index): value is 1 => index < '3')); // $ExpectError
});
