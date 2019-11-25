import { of, forkJoin, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

describe('deprecated rest args', () => {
  it('should infer correctly with 1 parameter', () => {
    const a = of(1, 2, 3);
    expectType<Observable<[number]>>(forkJoin(a));
  });

  it('should infer correctly with 2 parameters', () => {
    const a = of(1, 2, 3);
    const b = of('a', 'b', 'c');
    expectType<Observable<[number, string]>>(forkJoin(a, b));
  });

  it('should infer correctly with 3 parameters', () => {
    const a = of(1, 2, 3);
    const b = of('a', 'b', 'c');
    const c = of(1, 2, 3);
    expectType<Observable<[number, string, number]>>(forkJoin(a, b, c));
  });

  it('should infer correctly with 4 parameters', () => {
    const a = of(1, 2, 3);
    const b = of('a', 'b', 'c');
    const c = of(1, 2, 3);
    const d = of(1, 2, 3);
    expectType<Observable<[number, string, number, number]>>(forkJoin(a, b, c, d));
  });

  it('should infer correctly with 5 parameters', () => {
    const a = of(1, 2, 3);
    const b = of('a', 'b', 'c');
    const c = of(1, 2, 3);
    const d = of(1, 2, 3);
    const e = of(1, 2, 3);
    expectType<Observable<[number, string, number, number, number]>>(forkJoin(a, b, c, d, e));
  });

  it('should infer correctly with 6 parameters', () => {
    const a = of(1, 2, 3);
    const b = of('a', 'b', 'c');
    const c = of(1, 2, 3);
    const d = of(1, 2, 3);
    const e = of(1, 2, 3);
    const f = of(1, 2, 3);
    expectType<Observable<[number, string, number, number, number, number]>>(forkJoin(a, b, c, d, e, f));
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
  expectType<Observable<any>>(forkJoin(a, b, c, d, e, f, g));
});

describe('forkJoin({})', () => {
  it('should properly type empty objects', () => {
    expectType<Observable<never>>(forkJoin({}));
  });

  it('should work for the simple case', () => {
    expectType<Observable<{ foo: number; bar: string; baz: boolean; }>>(forkJoin({ foo: of(1), bar: of('two'), baz: of(false) }));
  });
});

describe('forkJoin([])', () => {
  // TODO(benlesh): Uncomment for TS 3.0
  // it('should properly type empty arrays', () => {
  expectType<Observable<never>>(forkJoin([]));
  // });

  it('should infer correctly for array of 1 observable', () => {
    expectType<Observable<[number]>>(forkJoin([of(1, 2, 3)]));
  });

  it('should infer correctly for array of 2 observables', () => {
    expectType<Observable<[number, string]>>(forkJoin([of(1, 2, 3), of('a', 'b', 'c')]));
  });

  it('should infer correctly for array of 3 observables', () => {
    expectType<Observable<[number, string, boolean]>>(forkJoin([of(1, 2, 3), of('a', 'b', 'c'), of(true, true, false)]));
  });

  it('should infer correctly for array of 4 observables', () => {
    expectType<Observable<[number, string, number, number]>>(forkJoin([of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3)]));
  });

  it('should infer correctly for array of 5 observables', () => {
    expectType<Observable<[number, string, number, number, number]>>(forkJoin([of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3)]));
  });

  it('should infer correctly for array of 6 observables', () => {
    expectType<Observable<[number, string, number, number, number, number]>>(forkJoin([of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3)]));
  });

  it('should force user cast for array of 6+ observables', () => {
    expectType<Observable<(string | number)[]>>(forkJoin([of(1, 2, 3), of('a', 'b', 'c'), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3), of(1, 2, 3)]));
  });
});
