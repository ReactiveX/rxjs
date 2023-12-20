import { throwError } from 'rxjs';

it('should error for incorrect errorFactory', () => {
  const a = throwError(1); // $ExpectError
  const b = throwError('a'); // $ExpectError
  const c = throwError({ a: 1 }); // $ExpectError
});

it('should accept any type and return never observable with support of factory', () => {
  const a = throwError(() => (1)); // $ExpectType Observable<never>
  const b = throwError(() => ('a')); // $ExpectType Observable<never>
  const c = throwError(() => ({ a: 1 })); // $ExpectType Observable<never>
  const d = throwError(() => ({ a: 2 })); // $ExpectType Observable<never>
});
