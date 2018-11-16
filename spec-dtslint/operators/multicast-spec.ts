import { of, Subject, Observable } from 'rxjs';
import { multicast } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(multicast(new Subject<number>())); // $ExpectType Observable<number>
  const p = of(1, 2, 3).pipe(multicast(() => new Subject<number>())); // $ExpectType Observable<number>
});

it('should be possible to use a this with in a SubjectFactory', () => {
  const o = of(1, 2, 3).pipe(multicast(function(this: Observable<number>) { return new Subject<number>(); })); // $ExpectType Observable<number>
});

it('should be possible to use a selector', () => {
  const p = of(1, 2, 3).pipe(multicast(() => new Subject<number>(), p => p)); // $ExpectType Observable<number>
  const o = of(1, 2, 3).pipe(multicast(() => new Subject<number>(), p => of('foo'))); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const p = of(1, 2, 3).pipe(multicast()); // $ExpectError
});

it('should enforce SubjectFactory type', () => {
  const p = of(1, 2, 3).pipe(multicast('foo')); // $ExpectError
  const q = of(1, 2, 3).pipe(multicast(() => new Subject<string>())); // $ExpectError
  const r = of(1, 2, 3).pipe(multicast(new Subject<number>(), p => p)); // $ExpectError
});

it('should enforce the type', () => {
  const o = of(1, 2, 3).pipe(multicast(() => new Subject<number>(), 5)); // $ExpectError
  const p = of(1, 2, 3).pipe(multicast(() => new Subject<number>(), (p: string) => 5)); // $ExpectError
});

it('should enfore the use of `this`', () => {
  const o = of(1, 2, 3).pipe(multicast(function(foo: Observable<number>) { return new Subject<number>(); })); // $ExpectError
});
