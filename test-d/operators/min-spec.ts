import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { min } from 'rxjs/operators';

it('should infer correctly', () => {
    expectType<Observable<number>>(of(1, 2, 3).pipe(min()));
    expectType<Observable<string>>(of('abc', 'bcd', 'def').pipe(min()));
});

it('should except empty comparer', () => {
    expectType<Observable<number>>(of(1, 2, 3).pipe(min()));
});

it('should enforce comparer types', () => {
    expectType<Observable<number>>(of(1, 2, 3).pipe(min((a: number, b: number) => a - b)));
    expectError(of(1, 2, 3).pipe(min((a: number, b: string) => 0)));
    expectError(of(1, 2, 3).pipe(min((a: string, b: number) => 0)));
});
