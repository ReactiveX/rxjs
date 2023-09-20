import { of } from 'rxjs';
import { combineLatestWith } from 'rxjs/operators';

describe('combineLatestWith', () => {
  describe('without project parameter', () => {
    it('should infer correctly with 1 param', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const res = a.pipe(combineLatestWith(b)); // $ExpectType Observable<[number, string]>
    });

    it('should infer correctly with 2 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const res = a.pipe(combineLatestWith(b, c)); // $ExpectType Observable<[number, string, string]>
    });

    it('should infer correctly with 3 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const res = a.pipe(combineLatestWith(b, c, d)); // $ExpectType Observable<[number, string, string, string]>
    });

    it('should infer correctly with 4 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      const res = a.pipe(combineLatestWith(b, c, d, e)); // $ExpectType Observable<[number, string, string, string, string]>
    });

    it('should infer correctly with 5 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      const f = of('m', 'n', 'o');
      const res = a.pipe(combineLatestWith(b, c, d, e, f)); // $ExpectType Observable<[number, string, string, string, string, string]>
    });

    it('should accept N params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of('d', 'e', 'f');
      const d = of('g', 'h', 'i');
      const e = of('j', 'k', 'l');
      const f = of('m', 'n', 'o');
      const g = of('p', 'q', 'r');
      const res = a.pipe(combineLatestWith(b, c, d, e, f, g)); // $ExpectType Observable<[number, string, string, string, string, string, string]>
    });
  });
});
