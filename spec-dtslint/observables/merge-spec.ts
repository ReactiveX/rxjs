import { merge, of, asapScheduler } from 'rxjs';

const o1 = of(1);
const o2 = of(2);
const o3 = of(3);
const o4 = of(4);
const o5 = of(5);
const o6 = of(6);
const o7 = of(7);

it('should infer correctly with 1 observable', () => {
  const a = merge(o1); // $ExpectType Observable<number>
});

it('should support concurrent parameter with 1 observable', () => {
  const a = merge(o1, 1); // $ExpectType Observable<number>
});

it('should support scheduler with 1 observable', () => {
  const a = merge(o1, 1, asapScheduler); // $ExpectType Observable<number>
});

it('should infer correctly with 2 observable', () => {
  const a = merge(o1, o2); // $ExpectType Observable<number>
});

it('should support concurrent parameter with 1 observable', () => {
  const a = merge(o1, o2, 1); // $ExpectType Observable<number>
});

it('should support scheduler with 1 observable', () => {
  const a = merge(o1, o2, 1, asapScheduler); // $ExpectType Observable<number>
});

it('should infer correctly with 3 observable', () => {
  const a = merge(o1, o2, o3); // $ExpectType Observable<number>
});

it('should support concurrent parameter with 3 observable', () => {
  const a = merge(o1, o2, o3, 1); // $ExpectType Observable<number>
});

it('should support scheduler with 3 observable', () => {
  const a = merge(o1, o2, o3, 1, asapScheduler); // $ExpectType Observable<number>
});

it('should infer correctly with 4 observable', () => {
  const a = merge(o1, o2, o3, o4); // $ExpectType Observable<number>
});

it('should support concurrent parameter with 4 observable', () => {
  const a = merge(o1, o2, o3, o4, 1); // $ExpectType Observable<number>
});

it('should support scheduler with 4 observable', () => {
  const a = merge(o1, o2, o3, o4, 1, asapScheduler); // $ExpectType Observable<number>
});

it('should infer correctly with 5 observable', () => {
  const a = merge(o1, o2, o3, o4, o5); // $ExpectType Observable<number>
});

it('should support concurrent parameter with 5 observable', () => {
  const a = merge(o1, o2, o3, o4, o5, 1); // $ExpectType Observable<number>
});

it('should support scheduler with 5 observable', () => {
  const a = merge(o1, o2, o3, o4, o5, 1, asapScheduler); // $ExpectType Observable<number>
});

it('should infer correctly with 6 observable', () => {
  const a = merge(o1, o2, o3, o4, o5, o6); // $ExpectType Observable<number>
});

it('should support concurrent parameter with 6 observable', () => {
  const a = merge(o1, o2, o3, o4, o5, o6, 1); // $ExpectType Observable<number>
});

it('should support scheduler with 6 observable', () => {
  const a = merge(o1, o2, o3, o4, o5, o6, 1, asapScheduler); // $ExpectType Observable<number>
});

it('should infer correctly with more than 6 observable', () => {
  const a = merge(o1, o2, o3, o4, o5, o6, o7); // $ExpectType Observable<number>
});

it('should support concurrent parameter with more than 6 observable', () => {
  const a = merge(o1, o2, o3, o4, o5, o6, o7, 1); // $ExpectType Observable<number>
});

it('should support scheduler with more than 6 observable', () => {
  const a = merge(o1, o2, o3, o4, o5, o6, o7, 1, asapScheduler); // $ExpectType Observable<number>
});
