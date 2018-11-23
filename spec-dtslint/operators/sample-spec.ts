import { of } from 'rxjs';
import { sample } from 'rxjs/operators';

it('should enforce parameter', () => {
  const a = of(1, 2, 3).pipe(sample()); // $ExpectError
});

it('should accept observable as notifier parameter', () => {
  const a = of(1, 2, 3).pipe(sample(of(4))); // $ExpectType Observable<number>
  const b = of(1, 2, 3).pipe(sample(of('a'))); // $ExpectType Observable<number>
});
