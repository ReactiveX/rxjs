import { of, asyncScheduler } from 'rxjs';
import { sampleTime } from 'rxjs/operators';

it('should enforce period parameter', () => {
  const a = of(1, 2, 3).pipe(sampleTime()); // $ExpectError
});

it('should infer correctly', () => { 
  const a = of(1, 2, 3).pipe(sampleTime(1000)); // $ExpectType Observable<number>
});

it('should accept scheduler parameter', () => {
  const a = of(1, 2, 3).pipe(sampleTime(1000, asyncScheduler)); // $ExpectType Observable<number>
});
