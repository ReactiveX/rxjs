import { of, asyncScheduler } from 'rxjs';
import { timestamp } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('a', 'b', 'c').pipe(timestamp()); // $ExpectType Observable<Timestamp<string>>
});

it('should support a scheduler', () => {
  const o = of('a', 'b', 'c').pipe(timestamp(asyncScheduler)); // $ExpectType Observable<Timestamp<string>>
});

it('should enforce scheduler type', () => {
  const o = of('a', 'b', 'c').pipe(timestamp('nope')); // $ExpectError
});
