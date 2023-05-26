import { of, bufferWhen } from 'rxjs';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(bufferWhen(() => of('a', 'b', 'c'))); // $ExpectType Observable<number[]>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(bufferWhen()); // $ExpectError
});

it('should enforce type of closingSelector', () => {
  const o = of(1, 2, 3).pipe(bufferWhen(of('a', 'b', 'c'))); // $ExpectError
});
