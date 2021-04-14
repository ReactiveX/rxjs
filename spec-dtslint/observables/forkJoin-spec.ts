import { a$, b$, c$ } from 'helpers';
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
  const res = forkJoin(a, b, c, d, e, f, g); // $ExpectType Observable<[number, string, number, number, number, number, number]>
});

describe('forkJoin({})', () => {
  it('should properly type empty objects', () => {
    const res = forkJoin({}); // $ExpectType Observable<never>
  });

  it('should work for the simple case', () => {
    const res = forkJoin({ foo: of(1), bar: of('two'), baz: of(false) }); // $ExpectType Observable<{ foo: number; bar: string; baz: boolean; }>
  });

  it('should not rely upon the excess-properties behavior to identify empty objects', () => {
    const obj = { foo: of(1), bar: of('two'), baz: of(false) };
    const res = forkJoin(obj); // $ExpectType Observable<{ foo: number; bar: string; baz: boolean; }>
  });

  it('should reject non-ObservableInput values', () => {
    const obj = { answer: 42 };
    const res = forkJoin(obj); // $ExpectError

  });
});

describe('forkJoin([])', () => {
  it('should properly type empty arrays', () => {
    const res = forkJoin([]); // $ExpectType Observable<never>
    const resConst = forkJoin([] as const); // $ExpectType Observable<never>
  });

    it('should properly type readonly arrays', () => {
    const res = forkJoin([a$, b$, c$] as const); // $ExpectType Observable<[A, B, C]>
  });

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
    const res = forkJoin([of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3)]); // $ExpectType Observable<[number, string, number, number, number, number, number]>
  });

  it('should return unknown for argument of any', () => {
    const arg: any = null;
    const res = forkJoin(arg); // $ExpectType Observable<unknown>
  })
});
