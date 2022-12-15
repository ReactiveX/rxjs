import { of } from 'rxjs';
import { window } from 'rxjs/operators';

it('should infer correctly', () => {
  of(1).pipe(window(of('1'))); // $ExpectType Observable<Observable<number>>
});

it('should enforce types', () => {
  of(1).pipe(window()); // $ExpectError
  of(1).pipe(window(6)); // $ExpectError
});

it('should support Promises', () => {
  of(1, 2, 3).pipe(window(Promise.resolve('foo'))); // $ExpectType Observable<Observable<number>>
});
