import { of, Observable } from 'rxjs';
import { single } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('foo').pipe(single()); // $ExpectType Observable<string>
});

it('should support a value', () => {
  const o = of('foo').pipe(single(value => value === 'foo')); // $ExpectType Observable<string>
});

it('should support an index', () => {
  const o = of('foo').pipe(single((value, index) => index === 2)); // $Observable<string>
});

it('should support a source', () => {
  const o = of('foo').pipe(single((value, index, source) => value === 'foo')); // $Observable<string>
});

it('should enforce value type', () => {
  const o = of('foo').pipe(single(((value: number) => value === 2))); // $ExpectError
});

it('should enforce return type', () => {
  const o = of('foo').pipe(single(value => value)); // $ExpectError
});

it('should enforce index type', () => {
  const o = of('foo').pipe(single(((value, index: string) => index === '2'))); // $ExpectError
});

it('should enforce source type', () => {
  const o = of('foo').pipe(single(((value, index, source: Observable<number>) => value === 'foo'))); // $ExpectError
});
