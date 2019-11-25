import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { max } from 'rxjs/operators';

it('should infer correctly', () => {
    expectType<Observable<number>>(of(1, 2, 3).pipe(max()));
    expectType<Observable<string>>(of('abc', 'bcd', 'def').pipe(max()));
});

it(' should except empty comparer', () => {
    expectType<Observable<number>>(of(1, 2, 3).pipe(max()));
});

it('should enforce comparer types', () => {
    expectType<Observable<number>>(of(1, 2, 3).pipe(max((a: number, b: number) => a - b)));
    expectError(of(1, 2, 3).pipe(max((a: number, b: string) => 0)));
    expectError(of(1, 2, 3).pipe(max((a: string, b: number) => 0)));
});
