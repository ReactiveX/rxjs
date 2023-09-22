import { of } from 'rxjs';
import { windowToggle } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('a', 'b', 'c').pipe(windowToggle(of(1, 2, 3), () => of({}))); // $ExpectType Observable<Observable<string>>
});

it('should enforce types', () => {
  const o = of('a', 'b', 'c').pipe(windowToggle()); // $ExpectError
});

it('should enforce openings type', () => {
  const o = of('a', 'b', 'c').pipe(windowToggle('nope')); // $ExpectError
});

it('should enforce closingSelector type', () => {
  const o = of('a', 'b', 'c').pipe(windowToggle(of(1, 2, 3), 'nope')); // $ExpectError
  const p = of('a', 'b', 'c').pipe(windowToggle(of(1, 2, 3), (closingSelector: string) => of(1))); // $ExpectError
});
