import { of, Observable } from 'rxjs';
import { publish } from 'rxjs/operators';

it('should support empty parameter', () => {
  // Typescript limitations - inference only happen in one direction from operator to pipe
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
