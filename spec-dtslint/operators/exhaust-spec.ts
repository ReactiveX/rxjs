import { of } from 'rxjs';
import { exhaust } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(of(1, 2, 3)).pipe(exhaust()); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(exhaust()); // $ExpectError
});

// TODO(benlesh): The following test fails for TypeScript 3.1, but passes in TypeScript 3.2
// I'm unsure what we need to do to get this so it ignores the TS 3.1 failure, as that's a bug
// in TypeScript, and this is properly typed now.

// it('should support union types', () => {
//   const a = Math.random() > 0.5 ? of(123) : of('abc');
//   const b = Math.random() > 0.5 ? of(123) : of('abc');
//   const source = of(a, b);
//   const o = source.pipe(exhaust()); // $ExpectType Observable<string | number>
// });
