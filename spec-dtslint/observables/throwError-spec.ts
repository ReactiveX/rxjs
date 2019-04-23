import { throwError, animationFrameScheduler } from 'rxjs';

it('should accept any type and return never observable', () => {
  const a = throwError(1); // $ExpectType Observable<never>
  const b = throwError('a'); // $ExpectType Observable<never>
  const c = throwError({a: 1}); // $ExpectType Observable<never>
});

it('should support scheduler', () => {
  const a = throwError(1, animationFrameScheduler); // $Expect Observable<never>
});
