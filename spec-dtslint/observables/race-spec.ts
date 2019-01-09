import { race, of } from 'rxjs';

it('should infer correctly with 1 parameter', () => {
  const a = of(1);
  const res = race(a); // $ExpectType Observable<number>
});

it('should infer correctly with multiple parameters of the same type', () => {
  const a = of(1);
  const b = of(2);
  const res = race(a, b); // $ExpectType Observable<number>
});

it('should not support multiple parameters with different type', () => {
  const a = of(1);
  const b = of('a');
  const res = race(a, b); // $ExpectError
});
