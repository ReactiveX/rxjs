import { of, timer, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { throttle } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(throttle(() => timer(47))));
});

it('should infer correctly with a Promise', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(throttle(() => new Promise<boolean>(() => {}))));
});

it('should support a config', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(throttle(() => timer(47), { leading: true, trailing: true })));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(throttle()));
  expectError(of(1, 2, 3).pipe(throttle(() => {})));
});

it('should enforce config types', () => {
  expectError(of(1, 2, 3).pipe(throttle(() => timer(47), { x: 1 })));
  expectError(of(1, 2, 3).pipe(throttle(() => timer(47), { leading: 1, trailing: 1 })));
  expectError(of(1, 2, 3).pipe(throttle(() => timer(47), null)));
});
