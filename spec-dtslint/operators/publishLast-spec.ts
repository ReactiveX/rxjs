import { of } from 'rxjs';
import { publishLast } from 'rxjs/operators';

it('should accept empty parameter', () => {
  // Here, TypeScript versions 3.1 and earlier infer Observable<any>. However,
  // the next version infers Observable<number>. It's not possible to specify
  // an upper bound for the TypeScript version used by dtslint, so an
  // expectation cannot be applied.
  // TODO: put the test back after Typescript > 3.2
  const a = of(1, 2, 3).pipe(publishLast());
});

it('should infer when type is specified', () => {
  const a = of(1, 2, 3).pipe<number>(publishLast()); // $ExpectType Observable<number>
});
