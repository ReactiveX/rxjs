import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { sampleTime } from 'rxjs/operators';

it('should enforce period parameter', () => {
  expectError(of(1, 2, 3).pipe(sampleTime()));
});

it('should infer correctly', () => { 
  expectType<Observable<number>>(of(1, 2, 3).pipe(sampleTime(1000)));
});

it('should accept scheduler parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(sampleTime(1000, asyncScheduler)));
});
