import { of, empty, animationFrameScheduler } from 'rxjs';

it('should infer correctly with no parameter', () => {
  const a = empty(); // $ExpectType Observable<never>
});

it('should support scheduler parameter', () => {
  const a = empty(animationFrameScheduler); // $ExpectType Observable<never>
});
