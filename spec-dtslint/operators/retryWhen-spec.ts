import { of } from 'rxjs';
import { retryWhen } from 'rxjs/operators';
import { asInteropObservable } from '../../spec/helpers/interop-helper';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(retryWhen(errors => errors)); // $ExpectType Observable<number>
});

it('should infer correctly when the error observable has a different type', () => {
  const o = of(1, 2, 3).pipe(retryWhen(retryWhen(errors => of('a', 'b', 'c')))); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(retryWhen()); // $ExpectError
});

it('should accept interop observable notifier', () => {
  of(1, 2, 3).pipe(retryWhen(() => asInteropObservable(of(true)))); // $ExpectType Observable<number>
});

it('should accept promise notifier', () => {
  of(1, 2, 3).pipe(retryWhen(() => Promise.resolve(true))); // $ExpectType Observable<number>
});

it('should async iterable notifier', () => {
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
  of(1, 2, 3).pipe(retryWhen(() => asyncRange)); // $ExpectType Observable<number>
});

it('should accept iterable notifier', () => {
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
  of(1, 2, 3).pipe(retryWhen(() => syncRange)); // $ExpectType Observable<number>
});

it('should accept readable stream notifier', () => {
  const readableStream = new ReadableStream<string>({
    pull(controller) {
      controller.enqueue('x');
      controller.close();
    },
  });
  of(1, 2, 3).pipe(retryWhen(() => readableStream)); // $ExpectType Observable<number>
});

it('should enforce types of the notifier', () => {
  of(1, 2, 3).pipe(retryWhen(() => 8)); // $ExpectError
});

it('should be deprecated', () => {
  of(1, 2, 3).pipe(retryWhen(() => of(true))); // $ExpectDeprecation
});