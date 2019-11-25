import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { skipUntil } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('foo', 'bar', 'baz').pipe(skipUntil(of(4, 'RxJS', 7))));
});

it('should enforce types', () => {
  expectError(of('foo', 'bar', 'baz').pipe(skipUntil()));
  expectError(of('foo', 'bar', 'baz').pipe(skipUntil('7')));
});
