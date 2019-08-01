import { of } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

it('should support a user-defined type guard', () => {
  const o = of('foo').pipe(takeWhile((s): s is 'foo' => true)); // $ExpectType Observable<"foo">
});

it('should support a user-defined type guard with inclusive option', () => {
  const o = of('foo').pipe(takeWhile((s): s is 'foo' => true, false)); // $ExpectType Observable<"foo">
});

it('should support a predicate', () => {
  const o = of('foo').pipe(takeWhile(s => true)); // $ExpectType Observable<string>
});

it('should support a predicate with inclusive option', () => {
  const o = of('foo').pipe(takeWhile(s => true, true)); // $ExpectType Observable<string>
});
