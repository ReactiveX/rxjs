import { of } from 'rxjs';
import { windowWhen } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('a', 'b', 'c').pipe(windowWhen(() => of(1, 2, 3))); // $ExpectType Observable<Observable<string>>
});

it('should enforce types', () => {
  const o = of('a', 'b', 'c').pipe(windowWhen()); // $ExpectError
});

it('should enforce closingSelector type', () => {
  const o = of('a', 'b', 'c').pipe(windowWhen('nope')); // $ExpectError
});
