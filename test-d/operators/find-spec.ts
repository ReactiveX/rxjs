import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { find } from 'rxjs/operators';

it('should support a user-defined type guard', () => {
  expectType<Observable<"foo" | undefined>>(of('foo').pipe(find((s): s is 'foo' => true)));
});

it('should support a user-defined type guard that takes an index', () => {
  expectType<Observable<"foo" | undefined>>(of('foo').pipe(find((s, index): s is 'foo' => true)));
});

it('should support a user-defined type guard that takes an index and the source', () => {
  expectType<Observable<"foo" | undefined>>(of('foo').pipe(find((s, index, source): s is 'foo' => true)));
});

it('should support a predicate', () => {
  expectType<Observable<string | undefined>>(of('foo').pipe(find(s => true)));
});

it('should support a predicate that takes an index', () => {
  expectType<Observable<string | undefined>>(of('foo').pipe(find((s, index) => true)));
});

it('should support a predicate that takes an index and the source', () => {
  expectType<Observable<string | undefined>>(of('foo').pipe(find((s, index, source) => true)));
});
