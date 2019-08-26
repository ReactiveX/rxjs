import { of, Observable } from 'rxjs';
import { publish } from 'rxjs/operators';

it('should support empty parameter', () => {
  const a = of(1, 2, 3).pipe(publish()); // $ExpectType Observable<number>
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
