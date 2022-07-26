import { of } from 'rxjs';
import { repeatWhen } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(repeatWhen(errors => errors)); // $ExpectType Observable<number>
});

it('should infer correctly when the error observable has a different type', () => {
  const o = of(1, 2, 3).pipe(repeatWhen(repeatWhen(errors => of('a', 'b', 'c')))); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(repeatWhen()); // $ExpectError
});

it('should enforce types of the notifier', () => {
  const o = of(1, 2, 3).pipe(repeatWhen(() => 8)); // $ExpectError
});

it('should be deprecated', () => {
  const o = of(1, 2, 3).pipe(repeatWhen(() => of(true))); // $ExpectDeprecation
});