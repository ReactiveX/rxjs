import { of, Observable } from 'rxjs';
import { publish } from 'rxjs/operators';

it('should support empty parameter', () => {
  // Here, TypeScript versions 3.1 and earlier infer Observable<any>. However,
  // the next version infers Observable<number>. It's not possible to specify
  // an upper bound for the TypeScript version used by dtslint, so an
  // expectation cannot be applied.
  const a = of(1, 2, 3).pipe(publish()); // $ExpectType Observable<any>
});

it('should infer when type is specified', () => {
  const a = of(1, 2, 3).pipe<number>(publish()); // $ExpectType Observable<number>
});

it('should infer correctly with parameter', () => {
  const a = of(1, 2, 3).pipe(publish(x => x)); // $ExpectType Observable<number>
  const b = of('a', 'b', 'c').pipe(publish(x => x)); // $ExpectType Observable<string>
});

it('should enforce type on selector', () => {
  const a = of(1, 2, 3).pipe(publish((x: Observable<string>) => x)); // $ExpectError
});

it('should support union types in selector', () => {
  const a = of(1, 2, 3).pipe(publish(() => Math.random() > 0.5 ? of(123) : of('test'))); // $ExpectType Observable<string | number>
});
