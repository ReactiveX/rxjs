import { interval, animationFrameScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

  it('should infer correctly with number param', () => {
    expectType<Observable<number>>(interval(1));
  });

it('should infer correctly with no param', () => {
  expectType<Observable<number>>(interval());
});

  it('should support scheduler', () => {
    expectType<Observable<number>>(interval(1, animationFrameScheduler));
  });
