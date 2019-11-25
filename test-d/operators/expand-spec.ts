import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { expand } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(expand(value => of(value))));
  expectType<Observable<number>>(of(1, 2, 3).pipe(expand(value => [value])));
  expectType<Observable<number>>(of(1, 2, 3).pipe(expand(value => Promise.resolve(value))));
});

it('should infer correctly with a different type as the source', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(expand(value => of('foo'))));
  expectType<Observable<string>>(of(1, 2, 3).pipe(expand(value => ['foo'])));
  expectType<Observable<string>>(of(1, 2, 3).pipe(expand(value => Promise.resolve('foo'))));
});

it('should support a project function with index', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(expand((value, index) => of(index))));
});

it('should support concurrent parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(expand(value => of(1), 47)));
});

it('should support a scheduler', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(expand(value => of(1), 47, asyncScheduler)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(expand()));
});

it('should enforce project types', () => {
  expectError(of(1, 2, 3).pipe(expand((value: string, index) => of(1))));
  expectError(of(1, 2, 3).pipe(expand((value, index: string) => of(1))));
});

it('should enforce project return type', () => {
  expectError(of(1, 2, 3).pipe(expand(value => 1)));
});

it('should enforce concurrent type', () => {
  expectError(of(1, 2, 3).pipe(expand(value => of(1), 'foo')));
});

it('should enforce scheduler type', () => {
  expectError(of(1, 2, 3).pipe(expand(value => of(1), 47, 'foo')));
});

// TODO(benlesh): Fix this when TypeScript is capable of handling typing this.
// Currently we can't type this one properly because the projection function is
// recursively called with the values from the returned ObservableInput.
// it('should support union types', () => {
expectType<Observable<string | number>>(of(1).pipe(expand(x => typeof x === 'string' ? of(123) : of('test'))));
// });
