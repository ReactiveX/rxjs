import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(mergeMap(p => of(Boolean(p)))); // $ExpectType Observable<boolean>
});

it('should support a projector that takes an index', () => {
  const o = of(1, 2, 3).pipe(mergeMap((p, index) => of(Boolean(p)))); // $ExpectType Observable<boolean>
});

it('should support a concurrent parameter', () => {
  const o = of(1, 2, 3).pipe(mergeMap(p => of(Boolean(p)), 4)); // $ExpectType Observable<boolean>
});

it('should support union-type projections', () => {
  const o = of(Math.random()).pipe(mergeMap(n => n > 0.5 ? of('life') : of(42))); // $ExpectType Observable<string | number>
});

it('should support union-type projections with empty streams', () => {
  const o = of(1, 2, 3).pipe(mergeMap(n => Math.random() < 0.5 ? of(123) : of())); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(mergeMap()); // $ExpectError
});

it('should enforce the return type', () => {
  const o = of(1, 2, 3).pipe(mergeMap(p => p)); // $ExpectError
});

it('should produce `Observable<never>` when mapping to an `ObservableInput<never>`', () => {
  const o = of(1, 2, 3).pipe(mergeMap(n => Promise.reject())); // $ExpectType Observable<never>
});
