import { of, Subject, Observable, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { multicast } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(multicast(new Subject<number>())));
  expectType<Observable<number>>(of(1, 2, 3).pipe(multicast(() => new Subject<number>())));
});

it('should be possible to use a this with in a SubjectFactory', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(multicast(function(this: Observable<number>) { return new Subject<number>(); })));
});

it('should be possible to use a selector', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(multicast(new Subject<number>(), p => p)));
  expectType<Observable<string>>(of(1, 2, 3).pipe(multicast(new Subject<number>(), p => of('foo'))));
  expectType<Observable<number>>(of(1, 2, 3).pipe(multicast(() => new Subject<number>(), p => p)));
  expectType<Observable<string>>(of(1, 2, 3).pipe(multicast(() => new Subject<number>(), p => of('foo'))));
});

it('should support union types', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(multicast(new Subject<number>(), p => Math.random() > 0.5 ? of(123) : of('foo'))));
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(multicast(() => new Subject<number>(), p => Math.random() > 0.5 ? of(123) : of('foo'))));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(multicast()));
});

it('should enforce Subject type', () => {
  expectError(of(1, 2, 3).pipe(multicast('foo')));
  expectError(of(1, 2, 3).pipe(multicast(new Subject<string>())));
});

it('should enforce SubjectFactory type', () => {
  expectError(of(1, 2, 3).pipe(multicast('foo')));
  expectError(of(1, 2, 3).pipe(multicast(() => new Subject<string>())));
});

it('should enforce the selector type', () => {
  expectError(of(1, 2, 3).pipe(multicast(() => new Subject<number>(), 5)));
  expectError(of(1, 2, 3).pipe(multicast(() => new Subject<number>(), (p: string) => 5)));
});
