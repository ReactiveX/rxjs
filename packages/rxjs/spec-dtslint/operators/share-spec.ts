import { of } from 'rxjs';
import { share } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('foo', 'bar', 'baz').pipe(share()); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of('foo', 'bar', 'baz').pipe(share('abc')); // $ExpectError
});

it('should support Promises', () => {
  const factory = () => Promise.resolve();
  of(1, 2, 3).pipe(share({ resetOnError: factory, resetOnComplete: factory, resetOnRefCountZero: factory })); // $ExpectType Observable<number>
});
