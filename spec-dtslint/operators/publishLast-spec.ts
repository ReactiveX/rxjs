import { of } from 'rxjs';
import { publishLast } from 'rxjs/operators';

it('should accept empty parameter', () => {
  // Here, TypeScript versions 3.1 and earlier infer Observable<any>. However,
  // the next version infers Observable<number>. It's not possible to specify
  // an upper bound for the TypeScript version used by dtslint, so an
  // expectation cannot be applied.
  const a = of(1, 2, 3).pipe(publishLast()); // $ExpectType Observable<any>
});

it('should infer when type is specified', () => {
  const a = of(1, 2, 3).pipe<number>(publishLast()); // $ExpectType Observable<number>
});
