import { of } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(defaultIfEmpty()); // $ExpectType Observable<number>
});

it('should infer correctly with a defaultValue', () => {
  const o = of(1, 2, 3).pipe(defaultIfEmpty(47)); // $ExpectType Observable<number>
});

it('should infer correctly with a different type of defaultValue', () => {
  const o = of(1, 2, 3).pipe(defaultIfEmpty<number, string>('carbonara')); // $ExpectType Observable<string | number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(defaultIfEmpty(4, 5)); // $ExpectError
});
