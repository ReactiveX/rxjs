import { of } from 'rxjs';
import { asInteropObservable } from '../../spec/helpers/interop-helper';
import { distinct } from 'rxjs/operators';
import type { ReadableStreamLike } from '../../src/internal/types';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(distinct()); // $ExpectType Observable<number>
});

it('should accept a keySelector', () => {
  interface Person { name: string; }
  const o = of({ name: 'Tim' } as Person).pipe(distinct(person => person.name)); // $ExpectType Observable<Person>
});

it('should accept observable flush', () => {
  const o = of(1, 2, 3).pipe(distinct(n => n, of('t', 'i', 'm'))); // $ExpectType Observable<number>
});

it('should accept interop observable flush', () => {
  of(1, 2, 3).pipe(distinct(n => n, asInteropObservable(of('t', 'i', 'm')))); // $ExpectType Observable<number>
});

it('should accept array-like flush', () => {
  of(1, 2, 3).pipe(distinct(n => n, [1,2,3])); // $ExpectType Observable<number>
});

it('should accept promise flush', () => {
  of(1, 2, 3).pipe(distinct(n => n, Promise.resolve())); // $ExpectType Observable<number>
});

it('should accept async iterable flush', () => {
  const asyncRange = {
    from: 1,
    to: 2,
    [Symbol.asyncIterator]() {
      return {
        current: this.from,
        last: this.to,
        async next() {
          await Promise.resolve();
          const done = (this.current > this.last);
          return {
            done,
            value: done ? this.current++ : undefined
          };
        }
      };
    }
  };
  of(1, 2, 3).pipe(distinct(n => n, asyncRange)); // $ExpectType Observable<number>
});

it('should accept iterable flush', () => {
  const syncRange = {
    from: 1,
    to: 2,
    [Symbol.iterator]() {
      return {
        current: this.from,
        last: this.to,
        next() {
          const done = (this.current > this.last);
          return {
            done,
            value: done ? this.current++ : undefined
          };
        }
      };
    }
  };
  of(1, 2, 3).pipe(distinct(n => n, syncRange)); // $ExpectType Observable<number>
});

it('should accept readable stream flush', () => {
  const readable: ReadableStreamLike<string> = new ReadableStream<string>({
    pull(controller) {
      controller.enqueue('x');
      controller.close();
    },
  });
  of(1, 2, 3).pipe(distinct(n => n, readable)); // $ExpectType Observable<number>
});

it('should error with unsupported flush', () => {
  of(1, 2, 3).pipe(distinct(n => n, {})); // $ExpectError
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(distinct('F00D')); // $ExpectError
});

it('should enforce types of keySelector', () => {
  const o = of<{ id: string; }>({id: 'F00D'}).pipe(distinct(item => item.foo)); // $ExpectError
});
