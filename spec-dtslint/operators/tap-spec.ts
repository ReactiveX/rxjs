import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

it('should infer correctly', () => {
  const a = of(1, 2, 3).pipe(tap()); // $ExpectType Observable<number>
});

it('should accept partial observer', () => {
  const a = of(1, 2, 3).pipe(tap({ next: (x: number) => { } })); // $ExpectType Observable<number>
  const b = of(1, 2, 3).pipe(tap({ error: (x: any) => { } })); // $ExpectType Observable<number>
  const c = of(1, 2, 3).pipe(tap({ complete: () => { } })); // $ExpectType Observable<number>
});

it('should enforce type for next observer function', () => {
  const a = of(1, 2, 3).pipe(tap({ next: (x: string) => { } })); // $ExpectError
});

it('should deprecate the multi-argument usage', () => {
  const next = (value: number) => {};
  const error = (error: any) => {};
  const complete = () => {};
  const o = of(42);
  o.pipe(tap()); // $ExpectNoDeprecation
  o.pipe(tap({ next })); // $ExpectNoDeprecation
  o.pipe(tap({ next, error })); // $ExpectNoDeprecation
  o.pipe(tap({ next, complete })); // $ExpectNoDeprecation
  o.pipe(tap({ next, error, complete })); // $ExpectNoDeprecation
  o.pipe(tap({ error })); // $ExpectNoDeprecation
  o.pipe(tap({ error, complete })); // $ExpectNoDeprecation
  o.pipe(tap({ complete })); // $ExpectNoDeprecation
  o.pipe(tap(next)); // $ExpectNoDeprecation
  o.pipe(tap(null, error)); // $ExpectDeprecation
  o.pipe(tap(undefined, error)); // $ExpectDeprecation
  o.pipe(tap(null, error, complete)); // $ExpectDeprecation
  o.pipe(tap(undefined, error, complete)); // $ExpectDeprecation
  o.pipe(tap(null, null, complete)); // $ExpectDeprecation
  o.pipe(tap(undefined, undefined, complete)); // $ExpectDeprecation
});