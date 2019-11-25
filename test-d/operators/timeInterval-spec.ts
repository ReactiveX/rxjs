import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { timeInterval } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<TimeInterval<string>>>(of('a', 'b', 'c').pipe(timeInterval()));
});

it('should support a scheduler', () => {
  expectType<Observable<TimeInterval<string>>>(of('a', 'b', 'c').pipe(timeInterval(asyncScheduler)));
});

it('should enforce scheduler type', () => {
  expectError(of('a', 'b', 'c').pipe(timeInterval('nope')));
});
