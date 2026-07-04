import { of } from 'rxjs';
import { __OPERATOR__ } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(__OPERATOR__()); // $ExpectType Observable<number>
});

// TODO: assert invalid usages once the signature takes parameters, e.g.:
// it('should enforce types', () => {
//   const o = of(1, 2, 3).pipe(__OPERATOR__('wrong')); // $ExpectError
// });
