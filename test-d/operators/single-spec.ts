import { of, Observable, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { single } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('foo').pipe(single()));
});

it('should support a value', () => {
  expectType<Observable<string>>(of('foo').pipe(single(value => value === 'foo')));
});

it('should support an index', () => {
  const o = of('foo').pipe(single((value, index) => index === 2)); // $Observable<string>
});

it('should support a source', () => {
  const o = of('foo').pipe(single((value, index, source) => value === 'foo')); // $Observable<string>
});

it('should enforce value type', () => {
  expectError(of('foo').pipe(single(((value: number) => value === 2))));
});

it('should enforce return type', () => {
  expectError(of('foo').pipe(single(value => value)));
});

it('should enforce index type', () => {
  expectError(of('foo').pipe(single(((value, index: string) => index === '2'))));
});

it('should enforce source type', () => {
  expectError(of('foo').pipe(single(((value, index, source: Observable<number>) => value === 'foo'))));
});
