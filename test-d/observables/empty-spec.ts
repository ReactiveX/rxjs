import { of, empty, animationFrameScheduler, EMPTY, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

it('should infer correctly with no parameter', () => {
  expectType<Observable<never>>(empty());
});

it('should support scheduler parameter', () => {
  expectType<Observable<never>>(empty(animationFrameScheduler));
});

it('should always infer empty observable', () => {
  // Empty Observable that replace empty static function 
  expectType<Observable<never>>(EMPTY);
});
