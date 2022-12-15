import { of } from 'rxjs';
import { repeatWhen } from 'rxjs/operators';
import { asInteropObservable } from '../../spec/helpers/interop-helper';

it('should infer correctly', () => {
  of(1, 2, 3).pipe(repeatWhen(errors => errors)); // $ExpectType Observable<number>
});

it('should infer correctly when the error observable has a different type', () => {
  of(1, 2, 3).pipe(repeatWhen(errors => asInteropObservable(of('a', 'b', 'c')))); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  of(1, 2, 3).pipe(repeatWhen()); // $ExpectError
});

it('should accept interop observable notifier', () => {
  of(1, 2, 3).pipe(repeatWhen(() => asInteropObservable(of(true)))); // $ExpectType Observable<number>
});

it('should accept promise notifier', () => {
  of(1, 2, 3).pipe(repeatWhen(() => Promise.resolve(true))); // $ExpectType Observable<number>
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
  of(1, 2, 3).pipe(repeatWhen(() => asyncRange)); // $ExpectType Observable<number>
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
  of(1, 2, 3).pipe(repeatWhen(() => syncRange)); // $ExpectType Observable<number>
});

it('should accept readable stream notifier', () => {
  const readableStream = new ReadableStream<string>({
    pull(controller) {
      controller.enqueue('x');
      controller.close();
    },
  });
  of(1, 2, 3).pipe(repeatWhen(() => readableStream)); // $ExpectType Observable<number>
});

it('should enforce types of the notifier', () => {
  of(1, 2, 3).pipe(repeatWhen(() => 8)); // $ExpectError
});

it('should be deprecated', () => {
  of(1, 2, 3).pipe(repeatWhen(() => of(true))); // $ExpectDeprecation
});