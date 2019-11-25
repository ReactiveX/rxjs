import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { windowWhen } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<Observable<string>>>(of('a', 'b', 'c').pipe(windowWhen(() => of(1, 2, 3))));
});

it('should enforce types', () => {
  expectError(of('a', 'b', 'c').pipe(windowWhen()));
});

it('should enforce closingSelector type', () => {
  expectError(of('a', 'b', 'c').pipe(windowWhen('nope')));
});
