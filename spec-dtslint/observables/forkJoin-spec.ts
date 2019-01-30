import { of, forkJoin } from 'rxjs';

it('should infer correctly with 1 parameter', () => {
  const a = of(1, 2, 3);
  const res = forkJoin(a); // $ExpectType Observable<number[]>
});

it('should infer correctly with 2 parameters', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const res = forkJoin(a, b); // $ExpectType Observable<[number, string]>
});

it('should infer correctly with 3 parameters', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of(1, 2, 3);
  const res = forkJoin(a, b, c); // $ExpectType Observable<[number, string, number]>
});

it('should infer correctly with 4 parameters', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of(1, 2, 3);
  const d = of(1, 2, 3);
  const res = forkJoin(a, b, c, d); // $ExpectType Observable<[number, string, number, number]>
});

it('should infer correctly with 5 parameters', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of(1, 2, 3);
  const d = of(1, 2, 3);
  const e = of(1, 2, 3);
  const res = forkJoin(a, b, c, d, e); // $ExpectType Observable<[number, string, number, number, number]>
});

it('should infer correctly with 6 parameters', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of(1, 2, 3);
  const d = of(1, 2, 3);
  const e = of(1, 2, 3);
  const f = of(1, 2, 3);
  const res = forkJoin(a, b, c, d, e, f); // $ExpectType Observable<[number, string, number, number, number, number]>
});

// TODO(benlesh): this needs to be fixed as well
// it('should infer of type any for more than 6 parameters', () => {
//   const a = of(1, 2, 3);
//   const b = of('a', 'b', 'c');
//   const c = of(1, 2, 3);
//   const d = of(1, 2, 3);
//   const e = of(1, 2, 3);
//   const f = of(1, 2, 3);
//   const g = of(1, 2, 3);
//   const res = forkJoin(a, b, c, d, e, f, g); // $ExpectType Observable<{}>
// });

it('should infer correctly for array of 1 observable', () => {
  const a = [of(1, 2, 3)];
  const res = forkJoin(a); // $ExpectType Observable<number[]>
});

// TODO(benlesh): We need to fix forkJoin so these pass
// it('should infer correctly for array of 2 observables', () => {
//   const a = [of(1, 2, 3), of('a', 'b', 'c')];
//   const res = forkJoin(a); // $ExpectType Observable<[number, string]>
// });

// it('should infer correctly for array of 3 observables', () => {
//   const a = [of(1, 2, 3), of('a', 'b', 'c'), of(true, true, false)];
//   const res = forkJoin(a); // $ExpectType Observable<[number, string, boolean]>
// });

// it('should infer correctly for array of 4 observables', () => {
//   const a = [of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3)];
//   const res = forkJoin(a); // $ExpectType Observable<[number, string, number, number]>
// });

// it('should infer correctly for array of 5 observables', () => {
//   const a = [of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3)];
//   const res = forkJoin(a); // $ExpectType Observable<[number, string, number, number, number]>
// });

// it('should infer correctly for array of 6 observables', () => {
//   const a = [of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3)];
//   const res = forkJoin(a); // $ExpectType Observable<[number, string, number, number, number, number]>
// });

// it('should force user cast for array of 6+ observables', () => {
//   const a = [of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3)];
//   const res = forkJoin(a); // $ExpectType Observable<{}>
// });
