import { of } from 'rxjs';
import { sample } from 'rxjs/operators';
import { asInteropObservable } from '../../spec/helpers/interop-helper';

it('should enforce parameter', () => {
  of(1, 2, 3).pipe(sample()); // $ExpectError
});

it('should accept observable as notifier parameter', () => {
  of(1, 2, 3).pipe(sample(of(4))); // $ExpectType Observable<number>
  of(1, 2, 3).pipe(sample(of('a'))); // $ExpectType Observable<number>
});

it('should accept interop observable notifier', () => {
  of(1, 2, 3).pipe(sample(asInteropObservable(of(true)))); // $ExpectType Observable<number>
});

it('should accept promise notifier', () => {
  of(1, 2, 3).pipe(sample(Promise.resolve(true))); // $ExpectType Observable<number>
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
  of(1, 2, 3).pipe(sample(asyncRange)); // $ExpectType Observable<number>
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
  of(1, 2, 3).pipe(sample(syncRange)); // $ExpectType Observable<number>
});

it('should accept readable stream notifier', () => {
  const readableStream = new ReadableStream<string>({
    pull(controller) {
      controller.enqueue('x');
      controller.close();
    },
  });
  of(1, 2, 3).pipe(sample(readableStream)); // $ExpectType Observable<number>
});

it('should enforce types of the notifier', () => {
  of(1, 2, 3).pipe(sample(8)); // $ExpectError
});
