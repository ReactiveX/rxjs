import { of, timer, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { debounce } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(debounce(() => timer(47))));
});

it('should infer correctly with a Promise', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(debounce(() => new Promise<boolean>(() => {}))));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(debounce()));
  expectError(of(1, 2, 3).pipe(debounce(() => {})));
});
