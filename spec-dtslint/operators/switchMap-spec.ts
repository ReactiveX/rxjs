import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(switchMap(p => of(Boolean(p)))); // $ExpectType Observable<boolean>
});

it('should support a projector that takes an index', () => {
  const o = of(1, 2, 3).pipe(switchMap((p, index) => of(Boolean(p)))); // $ExpectType Observable<boolean>
});

it('should infer correctly by using the resultSelector first parameter', () => {
  const o = of(1, 2, 3).pipe(switchMap(p => of(Boolean(p)), a => a)); // $ExpectType Observable<number>
});

it('should infer correctly by using the resultSelector second parameter', () => {
  const o = of(1, 2, 3).pipe(switchMap(p => of(Boolean(p)), (a, b) => b)); // $ExpectType Observable<boolean>
});

it('should support a resultSelector that takes an inner index', () => {
  const o = of(1, 2, 3).pipe(switchMap(p => of(Boolean(p)), (a, b, innnerIndex) => a)); // $ExpectType Observable<number>
});

it('should support a resultSelector that takes an inner and outer index', () => {
  const o = of(1, 2, 3).pipe(switchMap(p => of(Boolean(p)), (a, b, innnerIndex, outerIndex) => a)); // $ExpectType Observable<number>
});

it('should support an undefined resultSelector', () => {
  const o = of(1, 2, 3).pipe(switchMap(p => of(Boolean(p)), undefined)); // $ExpectType Observable<boolean>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(switchMap()); // $ExpectError
});

it('should enforce the return type', () => {
  const o = of(1, 2, 3).pipe(switchMap(p => p)); // $ExpectError
});
