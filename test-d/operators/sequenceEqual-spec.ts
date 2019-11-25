import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { sequenceEqual } from 'rxjs/operators';

it('should enforce compareTo Observable', () => {
  expectError(of(1, 2, 3).pipe(sequenceEqual()));
});

it('should infer correctly give compareTo Observable', () => {
  expectType<Observable<boolean>>(of(1, 2, 3).pipe(sequenceEqual(of(1))));
});

it('should enforce compareTo to be the same type of Observable', () => {
  expectError(of(1, 2, 3).pipe(sequenceEqual(of('a'))));
});

it('should infer correcly given comparor parameter', () => {
  expectType<Observable<boolean>>(of(1, 2, 3).pipe(sequenceEqual(of(1), (val1, val2) => val1 === val2)));
});
