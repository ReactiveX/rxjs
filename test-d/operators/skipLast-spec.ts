import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { skipLast } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('foo', 'bar', 'baz').pipe(skipLast(7)));
});

it('should enforce types', () => {
  expectError(of('foo', 'bar', 'baz').pipe(skipLast()));
  expectError(of('foo', 'bar', 'baz').pipe(skipLast('7')));
});
