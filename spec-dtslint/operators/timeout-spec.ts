import { of, asyncScheduler } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { A } from '../helpers';

it('should infer correctly', () => {
  const o = of('a', 'b', 'c').pipe(timeout(10)); // $ExpectType Observable<string>
});

it('should support a date', () => {
  const o = of('a', 'b', 'c').pipe(timeout(new Date())); // $ExpectType Observable<string>
});

it('should support a scheduler', () => {
  const o = of('a', 'b', 'c').pipe(timeout(10, asyncScheduler)); // $ExpectType Observable<string>
  const p = of('a', 'b', 'c').pipe(timeout(new Date(), asyncScheduler)); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of('a', 'b', 'c').pipe(timeout()); // $ExpectError
});

it('should enforce types of due', () => {
  const o = of('a', 'b', 'c').pipe(timeout('foo')); // $ExpectError
});

it('should enforce types of scheduler', () => {
  const o = of('a', 'b', 'c').pipe(timeout(5, 'foo')); // $ExpectError
});

it('Check info argument to factory', () => {
  const o = of('a').pipe( // $ExpectType Observable<string | number>
    timeout({
      meta: new A(),
      with: (info) => {
        const i = info; // $ExpectType TimeoutInfo<string, A>
        const m = info.meta; // $ExpectType A
        const s = info.seen; // $ExpectType number
        const l = info.lastValue; // $ExpectType string | null
        // These should be readonly
        info.meta = new A(); // $ExpectError
        info.seen = 12; // $ExpectError
        info.lastValue = 'blah'; // $ExpectError
        return of(123);
      }
    })
  );
});

it('Check config arguments', () => {
  const o = of('a').pipe( // $ExpectType Observable<string>
    timeout({
      first: 1000
    })
  );
});