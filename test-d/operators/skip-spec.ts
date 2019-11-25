import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { skip } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('foo', 'bar', 'baz').pipe(skip(7)));
});

it('should enforce types', () => {
  expectError(of('foo', 'bar', 'baz').pipe(skip()));
  expectError(of('foo', 'bar', 'baz').pipe(skip('7')));
});
