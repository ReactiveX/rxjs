import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { elementAt } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('foo').pipe(elementAt(47)));
});

it('should support a default value', () => {
  expectType<Observable<string>>(of('foo').pipe(elementAt(47, 'bar')));
});

it('should enforce types', () => {
  expectError(of('foo').pipe(elementAt()));
});

it('should enforce of index', () => {
  expectError(of('foo').pipe(elementAt('foo')));
});

it('should enforce of default', () => {
  expectError(of('foo').pipe(elementAt(5, 5)));
});
