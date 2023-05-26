import { of, asyncScheduler, timeInterval } from 'rxjs';

it('should infer correctly', () => {
  const o = of('a', 'b', 'c').pipe(timeInterval()); // $ExpectType Observable<TimeInterval<string>>
});

it('should support a scheduler', () => {
  const o = of('a', 'b', 'c').pipe(timeInterval(asyncScheduler)); // $ExpectType Observable<TimeInterval<string>>
});

it('should enforce scheduler type', () => {
  const o = of('a', 'b', 'c').pipe(timeInterval('nope')); // $ExpectError
});
