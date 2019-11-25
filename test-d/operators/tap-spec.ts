import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { tap } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(tap()));
});

it('should accept partial observer', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(tap({ next: (x: number) => { } })));
  expectType<Observable<number>>(of(1, 2, 3).pipe(tap({ error: (x: any) => { } })));
  expectType<Observable<number>>(of(1, 2, 3).pipe(tap({ complete: () => { } })));
});

it('should not accept empty observer', () => {
  expectError(of(1, 2, 3).pipe(tap({})));
});

it('should enforce type for next observer function', () => {
  expectError(of(1, 2, 3).pipe(tap({ next: (x: string) => { })));
});
