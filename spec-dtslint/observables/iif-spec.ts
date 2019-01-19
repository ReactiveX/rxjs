import { iif, of } from 'rxjs';

it('should accept function as first parameter', () => {
  // Typescript limitation: cannot infer default value in params
  // e.g.: const a = iif(() => false, EMPTY, EMPTY) // $ExpectType Observable<never>
  // However, test below does not infer Observable<never> if no params is passed
  // although the default value for second and third param is EMPTY observable
  const a = iif(() => false); // $ExpectType Observable<{}>
});

it('should infer correctly with 2 parameters', () => {
  const a = iif(() => false, of(1)); // $ExpectType Observable<number | {}>
});

it('should infer correctly with 3 parameters', () => {
  const a = iif(() => false, of(1), of(2)); // $ExpectType Observable<number>
});

it('should infer correctly with 3 parameters of different types', () => {
  const a = iif(() => false, of(1), of('a')); // $ExpectType Observable<string | number>
});
