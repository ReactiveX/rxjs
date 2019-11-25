import { throwError, animationFrameScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

it('should accept any type and return never observable', () => {
  expectType<Observable<never>>(throwError(1));
  expectType<Observable<never>>(throwError('a'));
  expectType<Observable<never>>(throwError({a: 1}));
});

it('should support scheduler', () => {
  expectType<Observable<never>>(throwError(1, animationFrameScheduler));
});
