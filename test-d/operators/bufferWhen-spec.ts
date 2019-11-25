import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { bufferWhen } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferWhen(() => of('a', 'b', 'c'))));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(bufferWhen()));
});

it('should enforce type of closingSelector', () => {
  expectError(of(1, 2, 3).pipe(bufferWhen(of('a', 'b', 'c'))));
});
