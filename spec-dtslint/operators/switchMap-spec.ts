import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(switchMap(p => of(Boolean(p)))); // $ExpectType Observable<boolean>
});

it('should support a projector that takes an index', () => {
  const o = of(1, 2, 3).pipe(switchMap(p => of(Boolean(p)))); // $ExpectType Observable<boolean>
});

it('should support union-type projections with empty streams', () => {
  const o = of(1, 2, 3).pipe(switchMap(n => Math.random() < 0.5 ? of(123) : of())); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(switchMap()); // $ExpectError
});

it('should enforce the return type', () => {
  const o = of(1, 2, 3).pipe(switchMap(p => p)); // $ExpectError
});

it('should support projecting to union types', () => {
  const o = of(Math.random()).pipe(switchMap(n => n > 0.5 ? of(123) : of('test'))); // $ExpectType Observable<string | number>
});

it('should produce `Observable<never>` when mapping to an `ObservableInput<never>`', () => {
  const o = of(1, 2, 3).pipe(switchMap(n => Promise.reject())); // $ExpectType Observable<never>
});
