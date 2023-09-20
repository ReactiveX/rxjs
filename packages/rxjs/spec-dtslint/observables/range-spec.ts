import { range, animationFrameScheduler } from 'rxjs';

it('should infer correctly with number parameters', () => {
  const a = range(1, 2); // $ExpectType Observable<number>
});

it('should accept only number parameters', () => {
  const a = range('a', 1); // $ExpectError
});

it('should allow 1 parameter', () => { 
  const a = range(1); // $ExpectType Observable<number>
});

it('should support scheduler', () => {
  const a = range(1, 2, animationFrameScheduler); // $ExpectType Observable<number>
});
