import { timer, animationFrameScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

it('should infer correctly with 1 parameter of number type', () => {
  expectType<Observable<number>>(timer(1));
});

it('should infer correctly with 1 parameter of date type', () => {
  expectType<Observable<number>>(timer((new Date())));
});

it('should not support string parameter', () => {
  expectError(timer('a'));
});

it('should infer correctly with 2 parameters', () => {
  expectType<Observable<number>>(timer(1, 2));
});

it('should support scheduler as second parameter', () => {
  expectType<Observable<number>>(timer(1, animationFrameScheduler));
});

it('should support scheduler as third parameter', () => {
  expectType<Observable<number>>(timer(1, 2, animationFrameScheduler));
});
