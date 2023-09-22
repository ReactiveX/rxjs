import { of } from 'rxjs';
import { switchAll } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(of(1, 2, 3)).pipe(switchAll()); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(switchAll()); // $ExpectError
});
