import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { throwIfEmpty } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(throwIfEmpty()));
});

it('should support an errorFactory', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(throwIfEmpty(() => 47)));
});

it('should enforce errorFactory type', () => {
  expectError(of('a', 'b', 'c').pipe(throwIfEmpty('nope')));
  expectError(of('a', 'b', 'c').pipe(throwIfEmpty(x => 47)));
});
