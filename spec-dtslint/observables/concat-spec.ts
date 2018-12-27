import { of, concat, asyncScheduler } from 'rxjs';

it('should accept 1 param', () => {
  const o = concat(of(1)); // $ExpectType Observable<number>
});

it('should accept 2 params', () => {
  const o = concat(of(1), of(2)); // $ExpectType Observable<number>
});

it('should accept 3 params', () => {
  const o = concat(of(1), of(2), of(3)); // $ExpectType Observable<number>
});

it('should accept 4 params', () => {
  const o = concat(of(1), of(2), of(3), of(4)); // $ExpectType Observable<number>
});

it('should accept 5 params', () => {
  const o = concat(of(1), of(2), of(3), of(4), of(5)); // $ExpectType Observable<number>
});

it('should accept 6 params', () => {
  const o = concat(of(1), of(2), of(3), of(4), of(5), of(6)); // $ExpectType Observable<number>
});

it('should accept more than 6 params', () => {
  const o = concat(of(1), of(2), of(3), of(4), of(5), of(6), of(7), of(8), of(9)); // $ExpectType Observable<number>
});

it('should accept scheduler after params', () => {
  const o = concat(of(4), of(5), of(6), asyncScheduler); // $ExpectType Observable<number>
});

it('should accept promises', () => {
  const o = concat(Promise.resolve(4)); // $ExpectType Observable<number>
});

it('should accept arrays', () => {
  const o = concat([4, 5]); // $ExpectType Observable<number>
});

it('should accept iterables', () => {
  const o = concat([1], 'foo'); // $ExpectType Observable<string | number>
});

it('should infer correctly with multiple types', () => {
  const o = concat(of('foo'), Promise.resolve<number[]>([1]), of(6)); // $ExpectType Observable<string | number | number[]>
});

it('should enforce types', () => {
  const o = concat(5); // $ExpectError
  const p = concat(of(5), 6); // $ExpectError
});
