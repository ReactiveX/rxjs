import { FOType, SinkArg } from '../types';
import { Subscription } from '../Subscription';

export function sinkFromHandlers<T>(nextHandler: (value: T, subscription: Subscription) => void, errorHandler: (err: any) => void, completeHandler: () => void) {
  return (type: FOType, arg: SinkArg<T>, subs: Subscription) => {
    switch (type) {
      case FOType.NEXT:
        if (typeof nextHandler === 'function') {
          nextHandler(arg, subs);
        }
        break;
      case FOType.ERROR:
        if (typeof errorHandler === 'function') {
          errorHandler(arg);
        }
        break;
      case FOType.COMPLETE:
        if (typeof completeHandler === 'function') {
          completeHandler();
        }
        break;
      default:
        break;
    }
  };
}
