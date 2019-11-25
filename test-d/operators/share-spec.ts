import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { share } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('foo', 'bar', 'baz').pipe(share()));
});

it('should enforce types', () => {
  expectError(of('foo', 'bar', 'baz').pipe(share('abc')));
});
