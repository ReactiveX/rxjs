import { of } from 'rxjs';
import { pluck } from 'rxjs/operators';

it('should infer empty interface when not specified', () => {
  const a = of([{ name: 'abc', id: 123 }, { name: 'def', id: 256 }]).pipe(pluck('name')); // $ExpectType Observable<{}>
});

it('should infer generic type', () => {
  const a = of([{ name: 'abc', id: 123 }, { name: 'def', id: 256 }]).pipe<string>(pluck('name')); // $ExpectType Observable<string>
});

it('should support nested object', () => {
  const a = of([{ name: 'abc', id: 123, address: { postcode: 1 } }, { name: 'def', id: 256, address: { postcode: 2 } }]).pipe(pluck('address', 'postcode')); // $ExpectType Observable<{}
});

it('should accept string only', () => {
  const a = of([{ name: 'abc', id: 123}, { name: 'def', id: 256}]).pipe(pluck(1)); // $ExpectError
});
