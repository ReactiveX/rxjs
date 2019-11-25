import { of, Observable, EMPTY, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { catchError } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(catchError((() => of(4, 5, 6)))));
});

it('should handle empty (never) appropriately', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(catchError(() => EMPTY)));
});

it('should handle a throw', () => {
  const f: () => never = () => { throw new Error('test'); };
  expectType<Observable<number>>(of(1, 2, 3).pipe(catchError(f)));
});

it('should infer correctly when not returning', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(catchError((() => { throw new Error('your hands in the air'); }))));
});

it('should infer correctly when returning another type', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(catchError((() => of('a', 'b', 'c')))));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(catchError()));
});

it('should enforce that selector returns an Observable', () => {
  expectError(of(1, 2, 3).pipe(catchError((err) => {})));
});

it('should enforce type of caught', () => {
  expectError(of(1, 2, 3).pipe(catchError((err, caught: Observable<string>) => of('a', 'b', 'c'))));
});

it('should handle union types', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(catchError(err => err.message === 'wee' ? of('fun') : of(123))));
});
