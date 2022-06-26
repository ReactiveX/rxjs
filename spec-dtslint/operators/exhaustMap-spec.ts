import { of } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(exhaustMap(p => of(Boolean(p)))); // $ExpectType Observable<boolean>
});

it('should support a projector that takes an index', () => {
  const o = of(1, 2, 3).pipe(exhaustMap((p, index) => of(Boolean(p)))); // $ExpectType Observable<boolean>
});

it('should report projections to union types', () => {
  const o = of(Math.random()).pipe(exhaustMap(n => n > 0.5 ? of('life') : of(42))); // $ExpectType Observable<string | number>
});

it('should support union-type projections with empty streams', () => {
  const o = of(1, 2, 3).pipe(exhaustMap(n => Math.random() < 0.5 ? of(123) : of())); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(exhaustMap()); // $ExpectError
});

it('should enforce the return type', () => {
  const o = of(1, 2, 3).pipe(exhaustMap(p => p)); // $ExpectError
});

it('should produce `Observable<never>` when mapping to an `ObservableInput<never>`', () => {
  const o = of(1, 2, 3).pipe(exhaustMap(n => Promise.reject())); // $ExpectType Observable<never>
});
