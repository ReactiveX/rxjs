import { throwError, animationFrameScheduler } from 'rxjs';

it('should accept any type and return never observable', () => {
  const a = throwError(1); // $ExpectType Observable<never>
  const b = throwError('a'); // $ExpectType Observable<never>
  const c = throwError({ a: 1 }); // $ExpectType Observable<never>
  const d = throwError(() => ({ a: 2 })); // $ExpectType Observable<never>
});

it('should support an error value and a scheduler', () => {
  const a = throwError(1, animationFrameScheduler); // $ExpectType Observable<never>
});

it('should accept any type and return never observable with support of factory', () => {
  const a = throwError(() => (1)); // $ExpectType Observable<never>
  const b = throwError(() => ('a')); // $ExpectType Observable<never>
  const c = throwError(() => ({ a: 1 })); // $ExpectType Observable<never>
  const d = throwError(() => ({ a: 2 })); // $ExpectType Observable<never>
});

it('should support a factory and a scheduler', () => {
  const a = throwError(() => 1, animationFrameScheduler); // $ExpectType Observable<never>
});
