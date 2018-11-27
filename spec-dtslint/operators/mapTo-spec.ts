import { of } from 'rxjs';
import { mapTo } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(mapTo(47)); // $ExpectType Observable<number>
});

it('should infer correctly when returning a different type', () => {
  const o = of(1, 2, 3).pipe(mapTo('carrot')); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(mapTo()); // $ExpectError
});
