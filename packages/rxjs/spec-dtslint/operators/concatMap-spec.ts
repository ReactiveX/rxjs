import { of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(concatMap(p => of(Boolean(p)))); // $ExpectType Observable<boolean>
});

it('should support a projector that takes an index', () => {
  const o = of(1, 2, 3).pipe(concatMap((p, index) => of(Boolean(p)))); // $ExpectType Observable<boolean>
});

it('should support union-type projections', () => {
  const o = of(Math.random()).pipe(concatMap(n => n > 0.5 ? of('life') : of(42))); // $ExpectType Observable<string | number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(concatMap()); // $ExpectError
});

it('should enforce the return type', () => {
  const o = of(1, 2, 3).pipe(concatMap(p => p)); // $ExpectError
});

it('should produce `Observable<never>` when mapping to an `ObservableInput<never>`', () => {
  const o = of(1, 2, 3).pipe(concatMap(n => Promise.reject())); // $ExpectType Observable<never>
});
