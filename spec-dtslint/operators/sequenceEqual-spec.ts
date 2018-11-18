import { of } from 'rxjs';
import { sequenceEqual } from 'rxjs/operators';

it('should enforce compareTo Observable', () => {
  const a = of(1, 2, 3).pipe(sequenceEqual()); // $ExpectError
});

it('should infer correctly give compareTo Observable', () => {
  const a = of(1, 2, 3).pipe(sequenceEqual(of(1))); // $ExpectType Observable<boolean>
});

it('should enforce compareTo to be the same type of Observable', () => {
  const a = of(1, 2, 3).pipe(sequenceEqual(of('a'))); // $ExpectError
});

it('should infer correcly given comparor parameter', () => {
  const a = of(1, 2, 3).pipe(sequenceEqual(of(1), (val1, val2) => val1 === val2)); // $ExpectType Observable<boolean>
});
