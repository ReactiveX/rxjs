import { of, forkJoin } from 'rxjs';

describe('deprecated rest args', () => {
  it('should infer correctly with 1 parameter', () => {
    const a = of(1, 2, 3);
    const res = forkJoin(a); // $ExpectType Observable<[number]>
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
});

it('should infer of type any for more than 6 parameters', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of(1, 2, 3);
  const d = of(1, 2, 3);
  const e = of(1, 2, 3);
  const f = of(1, 2, 3);
  const g = of(1, 2, 3);
  const res = forkJoin(a, b, c, d, e, f, g); // $ExpectType Observable<any>
});

describe('forkJoin({})', () => {
  it('should properly type empty objects', () => {
    const res = forkJoin({}); // $ExpectType Observable<never>
  });

  it('should work for the simple case', () => {
    const res = forkJoin({ foo: of(1), bar: of('two'), baz: of(false) }); // $ExpectType Observable<{ foo: number; bar: string; baz: boolean; }>
  });
});

describe('forkJoin([])', () => {
  // TODO(benlesh): Uncomment for TS 3.0
  // it('should properly type empty arrays', () => {
  //   const res = forkJoin([]); // $ExpectType Observable<never>
  // });

  it('should infer correctly for array of 1 observable', () => {
    const res = forkJoin([of(1, 2, 3)]); // $ExpectType Observable<[number]>
  });

  it('should infer correctly for array of 2 observables', () => {
    const res = forkJoin([of(1, 2, 3), of('a', 'b', 'c')]); // $ExpectType Observable<[number, string]>
  });

  it('should infer correctly for array of 3 observables', () => {
    const res = forkJoin([of(1, 2, 3), of('a', 'b', 'c'), of(true, true, false)]); // $ExpectType Observable<[number, string, boolean]>
  });

  it('should infer correctly for array of 4 observables', () => {
    const res = forkJoin([of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3)]); // $ExpectType Observable<[number, string, number, number]>
  });

  it('should infer correctly for array of 5 observables', () => {
    const res = forkJoin([of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3)]); // $ExpectType Observable<[number, string, number, number, number]>
  });

  it('should infer correctly for array of 6 observables', () => {
    const res = forkJoin([of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3)]); // $ExpectType Observable<[number, string, number, number, number, number]>
  });

  it('should force user cast for array of 6+ observables', () => {
    const res = forkJoin([of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3)]); // $ExpectType Observable<(string | number)[]>
  });
});
