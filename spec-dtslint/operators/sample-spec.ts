import { of, interval } from 'rxjs';
import { sample, delay } from 'rxjs/operators';

it('should enforce parameter', () => {
  const a = of(1, 2, 3).pipe(sample()); // $ExpectError
});

it('should accept observable as notifier parameter', () => {
  const a = interval(1000).pipe(sample(of(1).pipe(delay(2000)))); // $ExpectType Observable<number>
});
