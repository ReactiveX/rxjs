import { FOType, Sink } from '../types';
import { Subscription } from '../Subscription';
import { symbolAsyncIterator } from '../util/symbolAsyncIterator';

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
