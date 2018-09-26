import { of } from 'rxjs';
import { buffer } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(buffer(of('foo'))); // $ExpectType Observable<number[]>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(buffer()); // $ExpectError
  const p = of(1, 2, 3).pipe(buffer(6)); // $ExpectError
});
