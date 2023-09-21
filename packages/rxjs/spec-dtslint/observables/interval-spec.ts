import { interval, animationFrameScheduler } from 'rxjs';

  it('should infer correctly with number param', () => {
    const a = interval(1); // $ExpectType Observable<number>
  });

it('should infer correctly with no param', () => {
  const a = interval(); // $ExpectType Observable<number>
});

  it('should support scheduler', () => {
    const a = interval(1, animationFrameScheduler); // $ExpectType Observable<number>
  });
