import { of } from 'rxjs';
import { max } from 'rxjs/operators';

it('should infer correctly', () => {
    const a = of(1, 2, 3).pipe(max()); // $ExpectType Observable<number>
    const b = of('abc', 'bcd', 'def').pipe(max()); // $ExpectType Observable<string>
});

it(' should except empty comparer', () => {
    const a = of(1, 2, 3).pipe(max()); // $ExpectType Observable<number>
});

it('should infer on comparer types', () => {
    const a = of(1, 2, 3).pipe(max((a: number, b: number) => a <= b ? -1 : 1)); // $ExpectType Observable<number>
    const b = of(1, 2, 3).pipe(max((a: number, b: string) => a <= b ? -1 : 1)); // $ExpectError
    const c = of(1, 2, 3).pipe(max((a: string, b: number) => a <= b ? -1 : 1)); // $ExpectError
});
