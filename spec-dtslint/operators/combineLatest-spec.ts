import { of } from 'rxjs';
import { combineLatest } from 'rxjs/operators';

describe('combineLatest', () => {
  describe('without project parameter', () => {
    it('should infer correctly with 1 param', () => {
      const a = of(1, 2, 3);
      const b = ['a', 'b', 'c'];
      const res = a.pipe(combineLatest(b)); // $ExpectType Observable<[number, string]>
    });

    it('should infer correctly with 2 params', () => {
      const a = of(1, 2, 3);
      const b = ['a', 'b', 'c'];
      const c = ['d', 'e', 'f'];
      const res = a.pipe(combineLatest(b, c)); // $ExpectType Observable<[number, string, string]>
    });

    it('should infer correctly with 3 params', () => {
      const a = of(1, 2, 3);
      const b = ['a', 'b', 'c'];
      const c = ['d', 'e', 'f'];
      const d = ['g', 'h', 'i'];
      const res = a.pipe(combineLatest(b, c, d)); // $ExpectType Observable<[number, string, string, string]>
    });

    it('should infer correctly with 4 params', () => {
      const a = of(1, 2, 3);
      const b = ['a', 'b', 'c'];
      const c = ['d', 'e', 'f'];
      const d = ['g', 'h', 'i'];
      const e = ['j', 'k', 'l'];
      const res = a.pipe(combineLatest(b, c, d, e)); // $ExpectType Observable<[number, string, string, string, string]>
    });

    it('should infer correctly with 5 params', () => {
      const a = of(1, 2, 3);
      const b = ['a', 'b', 'c'];
      const c = ['d', 'e', 'f'];
      const d = ['g', 'h', 'i'];
      const e = ['j', 'k', 'l'];
      const f = ['m', 'n', 'o'];
      const res = a.pipe(combineLatest(b, c, d, e, f)); // $ExpectType Observable<[number, string, string, string, string, string]>
    });

    it('should only accept maximum params of 5', () => {
      const a = of(1, 2, 3);
      const b = ['a', 'b', 'c'];
      const c = ['d', 'e', 'f'];
      const d = ['g', 'h', 'i'];
      const e = ['j', 'k', 'l'];
      const f = ['m', 'n', 'o'];
      const g = ['p', 'q', 'r'];
      const res = a.pipe(combineLatest(b, c, d, e, f, g)); // $ExpectError
    });
  });

  describe('with project parameter', () => {
    it('should infer correctly with project param', () => {
      const a = of(1, 2, 3);
      const res = a.pipe(combineLatest(v1 => 'b')); // $ExpectType Observable<string>
    });

    it('should infer correctly with 1 param', () => {
      const a = of(1, 2, 3);
      const b = ['a', 'b', 'c'];
      const res = a.pipe(combineLatest(b, (a, b) => b)); // $ExpectType Observable<string>
    });

    it('should infer correctly with 2 params', () => {
      const a = of(1, 2, 3);
      const b = ['a', 'b', 'c'];
      const c = ['d', 'e', 'f'];
      const res = a.pipe(combineLatest(b, c, (a, b, c) => b + c)); // $ExpectType Observable<string>
    });

    it('should infer correctly with 3 params', () => {
      const a = of(1, 2, 3);
      const b = ['a', 'b', 'c'];
      const c = ['d', 'e', 'f'];
      const d = ['g', 'h', 'i'];
      const res = a.pipe(combineLatest(b, c, d, (a, b, c, d) => b + c)); // $ExpectType Observable<string>
    });

    it('should infer correctly with 4 params', () => {
      const a = of(1, 2, 3);
      const b = ['a', 'b', 'c'];
      const c = ['d', 'e', 'f'];
      const d = ['g', 'h', 'i'];
      const e = ['j', 'k', 'l'];
      const res = a.pipe(combineLatest(b, c, d, e, (a, b, c, d, e) => b + c)); // $ExpectType Observable<string>
    });

    it('should infer correctly with 5 params', () => {
      const a = of(1, 2, 3);
      const b = ['a', 'b', 'c'];
      const c = ['d', 'e', 'f'];
      const d = ['g', 'h', 'i'];
      const e = ['j', 'k', 'l'];
      const f = ['m', 'n', 'o'];
      const res = a.pipe(combineLatest(b, c, d, e, f, (a, b, c, d, e, f) => b + c)); // $ExpectType Observable<string>
    });

    it('should infer correctly with array param', () => {
      const a = of(1, 2, 3);
      const b = ['a', 'b', 'c'];
      const res = a.pipe(combineLatest(b, (a, b) => b)); // $ExpectType Observable<string>
    });
  });
});
