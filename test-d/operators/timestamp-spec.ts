import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { timestamp } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<Timestamp<string>>>(of('a', 'b', 'c').pipe(timestamp()));
});

it('should support a scheduler', () => {
  expectType<Observable<Timestamp<string>>>(of('a', 'b', 'c').pipe(timestamp(asyncScheduler)));
});

it('should enforce scheduler type', () => {
  expectError(of('a', 'b', 'c').pipe(timestamp('nope')));
});
