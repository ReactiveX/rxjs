import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { ignoreElements } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<never>>(of(1, 2, 3).pipe(ignoreElements()));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(ignoreElements('nope')));
});
