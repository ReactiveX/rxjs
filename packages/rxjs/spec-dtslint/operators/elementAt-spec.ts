import { of } from 'rxjs';
import { elementAt } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('foo').pipe(elementAt(47)); // $ExpectType Observable<string>
});

it('should support a default value', () => {
  const o = of('foo').pipe(elementAt(47, 'bar')); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of('foo').pipe(elementAt()); // $ExpectError
});

it('should enforce passing the index', () => {
  const o = of('foo').pipe(elementAt('foo')); // $ExpectError
});

it('should enforce of default', () => {
  const o = of('foo').pipe(elementAt(5, 5)); // $ExpectType Observable<string | number>
});

it('should allow undefined default', () => {
  const o = of('foo').pipe(elementAt(100, undefined)); // $ExpectType Observable<string | undefined>
});
