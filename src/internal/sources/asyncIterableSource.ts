import { FOType, Sink } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { symbolAsyncIterator } from 'rxjs/internal/util/symbolAsyncIterator';

export function asyncIterableSource<T>(input: AsyncIterable<T>) {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const ai = input[symbolAsyncIterator]() as AsyncIterator<T>;
      let getNextValue: () => Promise<void>;
      getNextValue = () => ai.next().then(result => {
        if (result.done) {
          sink(FOType.COMPLETE, undefined, subs);
        }
        else {
          sink(FOType.NEXT, result.value, subs);
          getNextValue();
        }
      }, err => {
        sink(FOType.ERROR, err, subs);
      });
      getNextValue();
    }
  };
}
