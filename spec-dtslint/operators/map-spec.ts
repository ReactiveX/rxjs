import { of } from 'rxjs';
import { map } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(map(value => value)); // $ExpectType Observable<number>
});

it('should infer correctly when returning a different type', () => {
  const o = of(1, 2, 3).pipe(map(String)); // $ExpectType Observable<string>
});

it('should support an index parameter', () => {
  const o = of('a', 'b', 'c').pipe(map((value, index) => index)); // $ExpectType Observable<number>
});

it('should support an extra parameter', () => {
  const o = of(1, 2, 3).pipe(map(value => value, 'something')); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(map()); // $ExpectError
});

it('should enforce the projecter types', () => {
  const o = of(1, 2, 3).pipe(map((value: string) => value)); // $ExpectError
  const p = of(1, 2, 3).pipe(map((value, index: string) => value)); // $ExpectError
});
