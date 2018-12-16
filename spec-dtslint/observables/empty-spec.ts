import { of, empty, animationFrameScheduler, EMPTY } from 'rxjs';

it('should infer correctly with no parameter', () => {
  const a = empty(); // $ExpectType Observable<never>
});

it('should support scheduler parameter', () => {
  const a = empty(animationFrameScheduler); // $ExpectType Observable<never>
});

it('should always infer empty observable', () => {
  // Empty Observable that replace empty static function 
  const a = EMPTY; // $ExpectType Observable<never>
});
