import { of, Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(catchError((() => of(4, 5, 6)))); // $ExpectType Observable<number>
});

it('should handle empty (never) appropriately', () => {
  const o = of(1, 2, 3).pipe(catchError(() => EMPTY)); // $ExpectType Observable<number>
});

it('should handle a throw', () => {
  const f: () => never = () => { throw new Error('test'); };
  const o = of(1, 2, 3).pipe(catchError(f)); // $ExpectType Observable<number>
});

it('should infer correctly when not returning', () => {
  const o = of(1, 2, 3).pipe(catchError((() => { throw new Error('your hands in the air'); }))); // $ExpectType Observable<number>
});

it('should infer correctly when returning another type', () => {
  const o = of(1, 2, 3).pipe(catchError((() => of('a', 'b', 'c')))); // $ExpectType Observable<string | number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(catchError()); // $ExpectError
});

it('should enforce that selector returns an Observable', () => {
  const o = of(1, 2, 3).pipe(catchError((err) => {})); // $ExpectError
});

it('should enforce type of caught', () => {
  const o = of(1, 2, 3).pipe(catchError((err, caught: Observable<string>) => of('a', 'b', 'c'))); // $ExpectError
});

it('should handle union types', () => {
  const o = of(1, 2, 3).pipe(catchError(err => err.message === 'wee' ? of('fun') : of(123))); // $ExpectType Observable<string | number>
});
