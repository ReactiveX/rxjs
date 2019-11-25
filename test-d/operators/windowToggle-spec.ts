import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { windowToggle } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<Observable<string>>>(of('a', 'b', 'c').pipe(windowToggle(of(1, 2, 3), () => of({}))));
});

it('should enforce types', () => {
  expectError(of('a', 'b', 'c').pipe(windowToggle()));
});

it('should enforce openings type', () => {
  expectError(of('a', 'b', 'c').pipe(windowToggle('nope')));
});

it('should enforce closingSelector type', () => {
  expectError(of('a', 'b', 'c').pipe(windowToggle(of(1, 2, 3), 'nope')));
  expectError(of('a', 'b', 'c').pipe(windowToggle(of(1, 2, 3), (closingSelector: string) => of(1))));
});
