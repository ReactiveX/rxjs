import { of } from 'rxjs';
import { min } from 'rxjs/operators';

it('should infer correctly', () => {
    const a = of(1, 2, 3).pipe(min()); // $ExpectType Observable<number>
    const b = of('abc', 'bcd', 'def').pipe(min()); // $ExpectType Observable<string>
});

it('should except empty comparer', () => {
    const a = of(1, 2, 3).pipe(min()); // $ExpectType Observable<number>
});

it('should enforce comparer types', () => {
    const a = of(1, 2, 3).pipe(min((a: number, b: number) => a - b)); // $ExpectType Observable<number>
    const b = of(1, 2, 3).pipe(min((a: number, b: string) => 0)); // $ExpectError
    const c = of(1, 2, 3).pipe(min((a: string, b: number) => 0)); // $ExpectError
});
