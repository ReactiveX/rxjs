import { of, timer } from 'rxjs';
import { throttle } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(throttle(() => timer(47))); // $ExpectType Observable<number>
});

it('should infer correctly with a Promise', () => {
  const o = of(1, 2, 3).pipe(throttle(() => new Promise<boolean>(() => {}))); // $ExpectType Observable<number>
});

it('should support a config', () => {
  const o = of(1, 2, 3).pipe(throttle(() => timer(47), { leading: true, trailing: true })); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(throttle()); // $ExpectError
  const p = of(1, 2, 3).pipe(throttle(() => {})); // $ExpectError
});

it('should enforce config types', () => {
  const o = of(1, 2, 3).pipe(throttle(() => timer(47), { x: 1 })); // $ExpectError
  const p = of(1, 2, 3).pipe(throttle(() => timer(47), { leading: 1, trailing: 1 })); // $ExpectError
  const q = of(1, 2, 3).pipe(throttle(() => timer(47), null)); // $ExpectError
});
