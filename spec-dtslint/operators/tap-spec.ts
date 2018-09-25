import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

it('should infer correctly', () => {
  const a = of(1, 2, 3).pipe(tap()); // $ExpectType Observable<number>
});

it('should accept partial observer', () => {
  const a = of(1, 2, 3).pipe(tap({ next: (x: number) => { } })); // $ExpectType Observable<number>
  const b = of(1, 2, 3).pipe(tap({ error: (x: any) => { } })); // $ExpectType Observable<number>
  const c = of(1, 2, 3).pipe(tap({ complete: () => { } })); // $ExpectType Observable<number>
});

it('should not accept empty observer', () => {
  const a = of(1, 2, 3).pipe(tap({})); // $ExpectError
});

it('should enforce type for next observer function', () => {
  const a = of(1, 2, 3).pipe(tap({ next: (x: string) => { })); // $ExpectError
});
