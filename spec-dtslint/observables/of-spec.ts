import { of, animationFrameScheduler } from 'rxjs';

it('should infer correctly with 1 param', () => {
  const a = of(1); 
});

it('should infer correcly with mixed type of 2 params', () => {
  const a = of(1, 'a'); // $ExpectType Observable<string | number>
});

it('should infer correcly with mixed type of 3 params', () => {
  const a = of(1, 'a', 2); // $ExpectType Observable<string | number>
});

it('should infer correcly with mixed type of 4 params', () => {
  const a = of(1, 'a', 2, 3); // $ExpectType Observable<string | number>
});

it('should infer correcly with mixed type of 5 params', () => {
  const a = of(1, 'a', 2, 3, 4); // $ExpectType Observable<string | number>
});

it('should infer correcly with mixed type of 6 params', () => {
  const a = of(1, 'a', 2, 3, 4, 5); // $ExpectType Observable<string | number>
});

it('should infer correcly with mixed type of 7 params', () => {
  const a = of(1, 'a', 2, 3, 4, 5, 6); // $ExpectType Observable<string | number>
});

it('should infer correcly with mixed type of 8 params', () => {
  const a = of(1, 'a', 2, 3, 4, 5, 6, 7); // $ExpectType Observable<string | number>
});

it('should infer correcly with mixed type of 9 params', () => {
  const a = of(1, 'a', 2, 3, 4, 5, 6, 7, 8); // $ExpectType Observable<string | number>
});

it('should infer correcly with mono type of more than 9 params', () => {
  const a = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10); // $ExpectType Observable<number>
});

it('should not support mixed type of more than 9 params', () => {
  const a = of(1, 'a', 2, 3, 4, 5, 6, 7, 8, 9); // $ExpectError
});

it('should support scheduler', () => {
  const a = of(1, animationFrameScheduler); // $ExpectType Observable<number>
});

it('should infer correctly with array', () => {
  const a = of([1, 2, 3]); // $ExpectType Observable<number[]>
});
