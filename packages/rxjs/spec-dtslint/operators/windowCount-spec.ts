import { of } from 'rxjs';
import { windowCount } from 'rxjs/operators';

it('should infer correctly', () => {
  of('test').pipe(windowCount(1)); // $ExpectType Observable<Observable<string>>
  of('test').pipe(windowCount(1, 2)); // $ExpectType Observable<Observable<string>>
});

it('should enforce windowSize type', () => {
  of(1).pipe(windowCount()); // $ExpectError
  of(1).pipe(windowCount('1')); // $ExpectError
});

it('should enforce startEveryWindow type', () => {
  of(1).pipe(windowCount(1, '2')); // $ExpectError
});
