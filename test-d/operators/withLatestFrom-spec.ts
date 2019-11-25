import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { withLatestFrom } from 'rxjs/operators';

describe('withLatestFrom', () => {
  describe('without project parameter', () => {
    it('should infer correctly with 1 param', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      expectType<Observable<[number, string]>>(a.pipe(withLatestFrom(b)));
    });

    it('should infer correctly with 2 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      expectType<Observable<[number, string, string]>>(a.pipe(withLatestFrom(b, c)));
    });

    it('should infer correctly with 3 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      expectType<Observable<[number, string, string, string]>>(a.pipe(withLatestFrom(b, c, d)));
    });

    it('should infer correctly with 4 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      expectType<Observable<[number, string, string, string, string]>>(a.pipe(withLatestFrom(b, c, d, e)));
    });

    it('should infer correctly with 5 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      const f = of('m', 'n', 'o');
      expectType<Observable<[number, string, string, string, string, string]>>(a.pipe(withLatestFrom(b, c, d, e, f)));
    });

    it('should only accept maximum params of 5', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      const f = of('m', 'n', 'o');
      const g = of('p', 'q', 'r');
      expectType<Observable<unknown>>(a.pipe(withLatestFrom(b, c, d, e, f, g)));
    });
  });

  describe('with project parameter', () => {
    it('should infer correctly with project param', () => {
      const a = of(1, 2, 3);
      expectType<Observable<string>>(a.pipe(withLatestFrom(v1 => 'b')));
    });

    it('should infer correctly with 1 param', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      expectType<Observable<string>>(a.pipe(withLatestFrom(b, (a, b) => b)));
    });

    it('should infer correctly with 2 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      expectType<Observable<string>>(a.pipe(withLatestFrom(b, c, (a, b, c) => b + c)));
    });

    it('should infer correctly with 3 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      expectType<Observable<string>>(a.pipe(withLatestFrom(b, c, d, (a, b, c, d) => b + c)));
    });

    it('should infer correctly with 4 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      expectType<Observable<string>>(a.pipe(withLatestFrom(b, c, d, e, (a, b, c, d, e) => b + c)));
    });

    it('should infer correctly with 5 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      const f = of('m', 'n', 'o');
      expectType<Observable<string>>(a.pipe(withLatestFrom(b, c, d, e, f, (a, b, c, d, e, f) => b + c)));
    });
  });
});
