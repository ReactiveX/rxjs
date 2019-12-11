import { iif, of } from 'rxjs';

it('should accept function as first parameter', () => {
  const a = iif(() => false); // $ExpectType Observable<never>
});

it('should infer correctly with 2 parameters', () => {
  const a = iif(() => false, of(1)); // $ExpectType Observable<number>
});

it('should infer correctly with 3 parameters', () => {
  const a = iif(() => false, of(1), of(2)); // $ExpectType Observable<number>
});

it('should infer correctly with 3 parameters of different types', () => {
  const a = iif(() => false, of(1), of('a')); // $ExpectType Observable<string | number>
});
