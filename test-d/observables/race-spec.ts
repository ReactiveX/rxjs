import { race, of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

it('should infer correctly with 1 parameter', () => {
  const a = of(1);
  expectType<Observable<number>>(race(a));
});

describe('race(a, b, c)', () => {
  it('should infer correctly with multiple parameters of the same type', () => {
    const a = of(1);
    const b = of(2);
    expectType<Observable<number>>(race(a, b));
  });

  it('should support 2 parameters with different types', () => {
    const a = of(1);
    const b = of('a');
    expectType<Observable<string | number>>(race(a, b));
  });

  it('should support 3 parameters with different types', () => {
    const a = of(1);
    const b = of('a');
    const c = of(true);
    expectType<Observable<string | number | boolean>>(race(a, b, c));
  });

  it('should support 4 parameters with different types', () => {
    const a = of(1);
    const b = of('a');
    const c = of(true);
    const d = of([1, 2, 3]);
    expectType<Observable<string | number | boolean | number[]>>(race(a, b, c, d));
  });

  it('should support 5 parameters with different types', () => {
    const a = of(1);
    const b = of('a');
    const c = of(true);
    const d = of([1, 2, 3]);
    const e = of(['blah']);
    expectType<Observable<string | number | boolean | number[] | string[]>>(race(a, b, c, d, e));
  });

  it('should support 6 or more parameters of the same type', () => {
    const a = of(1);
    expectType<Observable<number>>(race(a, a, a, a, a, a, a, a, a, a, a, a, a, a));
  });

  it('should return unknown for 6 or more arguments of different types', () => {
    const a = of(1);
    const b = of('a');
    const c = of(true);
    const d = of([1, 2, 3]);
    const e = of(['blah']);
    const f = of({ foo: 'bar' });
    expectType<Observable<unknown>>(race(a, b, c, d, e, f));
  });
});

describe('race([a, b, c])', () => {
  it('should infer correctly with multiple parameters of the same type', () => {
    const a = of(1);
    const b = of(2);
    expectType<Observable<number>>(race([a, b]));
  });

  it('should support 2 parameters with different types', () => {
    const a = of(1);
    const b = of('a');
    expectType<Observable<string | number>>(race([a, b]));
  });

  it('should support 3 parameters with different types', () => {
    const a = of(1);
    const b = of('a');
    const c = of(true);
    expectType<Observable<string | number | boolean>>(race([a, b, c]));
  });

  it('should support 4 parameters with different types', () => {
    const a = of(1);
    const b = of('a');
    const c = of(true);
    const d = of([1, 2, 3]);
    expectType<Observable<string | number | boolean | number[]>>(race([a, b, c, d]));
  });

  it('should support 5 parameters with different types', () => {
    const a = of(1);
    const b = of('a');
    const c = of(true);
    const d = of([1, 2, 3]);
    const e = of(['blah']);
    expectType<Observable<string | number | boolean | number[] | string[]>>(race([a, b, c, d, e]));
  });

  it('should support 6 or more parameters of the same type', () => {
    const a = of(1);
    expectType<Observable<number>>(race([a, a, a, a, a, a, a, a, a, a, a, a, a, a]));
  });

  it('should return {} for 6 or more arguments of different types', () => {
    const a = of(1);
    const b = of('a');
    const c = of(true);
    const d = of([1, 2, 3]);
    const e = of(['blah']);
    const f = of({ foo: 'bar' });
    expectType<Observable<unknown>>(race([a, b, c, d, e, f]));
  });
});

it('should race observable inputs', () => {
  expectType<Observable<string | number | boolean>>(race(of(1), Promise.resolve('foo'), [true, false]));
});

it('should race an array observable inputs', () => {
  expectType<Observable<string | number | boolean>>(race([of(1), Promise.resolve('foo'), [true, false]]));
});
