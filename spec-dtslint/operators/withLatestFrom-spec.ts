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
      const c = of(1, 2, 3);
      const res = a.pipe(withLatestFrom(b, c)); // $ExpectType Observable<[number, string, number]>
    });

    it('should infer correctly with 3 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of(1, 2, 3);
      const d = of('g', 'h', 'i');
      const res = a.pipe(withLatestFrom(b, c, d)); // $ExpectType Observable<[number, string, number, string]>
    });

    it('should infer correctly with 4 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of(1, 2, 3);
      const d = of('g', 'h', 'i');
      const e = of(4, 5, 6);
      const res = a.pipe(withLatestFrom(b, c, d, e)); // $ExpectType Observable<[number, string, number, string, number]>
    });

    it('should infer correctly with 5 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of(1, 2, 3);
      const d = of('g', 'h', 'i');
      const e = of(4, 5, 6);
      const f = of('m', 'n', 'o');
      const res = a.pipe(withLatestFrom(b, c, d, e, f)); // $ExpectType Observable<[number, string, number, string, number, string]>
    });

    it('should infer correctly with 6 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of(1, 2, 3);
      const d = of('g', 'h', 'i');
      const e = of(4, 5, 6);
      const f = of('m', 'n', 'o');
      const g = of(7, 8, 9);
      const res = a.pipe(withLatestFrom(b, c, d, e, f, g)); // $ExpectType Observable<[number, string, number, string, number, string, number]>
    });

    it('should allow the spreading of input params', () => {
      const a = of(1, 2, 3);
      const b = [a, a, a];
      const res = a.pipe(withLatestFrom(...b)); // $ExpectType Observable<[number, ...number[]]>
    });

    it('should error with non Observable input', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = 1;
      const d = of('g', 'h', 'i');
      const res = a.pipe(withLatestFrom(b, c, d)); // $ExpectError
    });

    it('should error with non Observable input at last position', () => {
      const a = of(1, 2, 3);
      const b = 1;
      const res = a.pipe(withLatestFrom(b)); // $ExpectError
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
      const c = of(1, 2, 3);
      const res = a.pipe(withLatestFrom(b, c, (a, b, c) => c)); // $ExpectType Observable<number>
    });

    it('should infer correctly with 3 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of(1, 2, 3);
      const d = of('g', 'h', 'i');
      const ref = a.pipe(withLatestFrom(b, c, d, (a, b, c, d) => b + c)); // $ExpectType Observable<string>
    });

    it('should infer correctly with 4 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of(1, 2, 3);
      const d = of('g', 'h', 'i');
      const e = of(4, 5, 6);
      const res = a.pipe(withLatestFrom(b, c, d, e, (a, b, c, d, e) => b + c)); // $ExpectType Observable<string>
    });

    it('should infer correctly with 5 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of(1, 2, 3);
      const d = of('g', 'h', 'i');
      const e = of(4, 5, 6);
      const f = of('m', 'n', 'o');
      const res = a.pipe(withLatestFrom(b, c, d, e, f, (a, b, c, d, e, f) => c + e)); // $ExpectType Observable<number>
    });

    it('should infer correctly with 6 params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = of(1, 2, 3);
      const d = of('g', 'h', 'i');
      const e = of(4, 5, 6);
      const f = of('m', 'n', 'o');
      const g = of(7, 8, 9);
      const res = a.pipe(withLatestFrom(b, c, d, e, f, g, (a, b, c, d, e, f, g) => b + f)); // $ExpectType Observable<string>
    });

    it('should error with non Observable input', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const c = 1;
      const d = of('g', 'h', 'i');
      const res = a.pipe(withLatestFrom(b, c, d, (a, b, c, d) => a + d)); // $ExpectError
    });

    it('should error with non Observable input at last position', () => {
      const a = of(1, 2, 3);
      const b = 1;
      const res = a.pipe(withLatestFrom(b, (a, b) => a + b)); // $ExpectError
    });

    it('should error with incorrect number of projected params', () => {
      const a = of(1, 2, 3);
      const b = of('a', 'b', 'c');
      const res = a.pipe(withLatestFrom(b, (a, b, c) => a)); // $ExpectError
    });

    /*
     * The following test does not typecheck because the project function is missing a third parameter.
     * If such an issue occurs in a consumer code base the fix is to specify the missing parameters.
     * 
     * It looks like this is a TS bug.
     */
    // it('should infer correct parameters with fewer arguments to project function', () => {
    //   const a = of(1, 2, 3);
    //   const b = of('a', 'b', 'c');
    //   const c = of(1, 2, 3);
    //   const res = a.pipe(withLatestFrom(b, c, (a, b) => b)); // $ExpectType Observable<string>
    // });
  });
});
