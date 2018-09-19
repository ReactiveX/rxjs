import { of } from 'rxjs';
import { skip } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('foo', 'bar', 'baz').pipe(skip(7)); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of('foo', 'bar', 'baz').pipe(skip()); // $ExpectError
  const p = of('foo', 'bar', 'baz').pipe(skip('7')); // $ExpectError
});
