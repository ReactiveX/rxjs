import { of } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

describe('withLatestFrom', () => {
  describe('without project parameter', () => {
    it('should infer correctly with 1 param', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const res = a.pipe(withLatestFrom(b)); // $ExpectType Observable<[number, string]>
    });

    it('should infer correctly with 2 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const res = a.pipe(withLatestFrom(b, c)); // $ExpectType Observable<[number, string, string]>
    });

    it('should infer correctly with 3 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const res = a.pipe(withLatestFrom(b, c, d)); // $ExpectType Observable<[number, string, string, string]>
    });

    it('should infer correctly with 4 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      const res = a.pipe(withLatestFrom(b, c, d, e)); // $ExpectType Observable<[number, string, string, string, string]>
    });

    it('should infer correctly with 5 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      const f = of('m', 'n', 'o');
      const res = a.pipe(withLatestFrom(b, c, d, e, f)); // $ExpectType Observable<[number, string, string, string, string, string]>
    });

    it('should only accept maximum params of 5', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      const f = of('m', 'n', 'o');
      const g = of('p', 'q', 'r');
      const res = a.pipe(withLatestFrom(b, c, d, e, f, g)); // $ExpectType Observable<{}>
    });
  });

  describe('with project parameter', () => {
    it('should infer correctly with project param', () => {
      const a = of(1, 2, 3);
      const res = a.pipe(withLatestFrom(v1 => 'b')); // $ExpectType Observable<string>
    });

    it('should infer correctly with 1 param', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const res = a.pipe(withLatestFrom(b, (a, b) => b)); // $ExpectType Observable<string>
    });

    it('should infer correctly with 2 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const res = a.pipe(withLatestFrom(b, c, (a, b, c) => b + c)); // $ExpectType Observable<string>
    });

    it('should infer correctly with 3 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const ref = a.pipe(withLatestFrom(b, c, d, (a, b, c, d) => b + c)); // $ExpectType Observable<string>
    });

    it('should infer correctly with 4 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      const res = a.pipe(withLatestFrom(b, c, d, e, (a, b, c, d, e) => b + c)); // $ExpectType Observable<string>
    });

    it('should infer correctly with 5 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      const f = of('m', 'n', 'o');
      const res = a.pipe(withLatestFrom(b, c, d, e, f, (a, b, c, d, e, f) => b + c)); // $ExpectType Observable<string>
    });
  });
});
