import { range, animationFrameScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

it('should infer correctly with number parameters', () => {
  expectType<Observable<number>>(range(1, 2));
});

it('should accept only number parameters', () => {
  expectError(range('a', 1));
});

it('should allow 1 parameter', () => { 
  expectType<Observable<number>>(range(1));
});

it('should support scheduler', () => {
  expectType<Observable<number>>(range(1, 2, animationFrameScheduler));
});
