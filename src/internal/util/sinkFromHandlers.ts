import { FOType, SinkArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';

export function sinkFromHandlers<T>(
  nextHandler: null|void|((value: T, subscription: Subscription) => void),
  errorHandler: null|void|((err: any) => void),
  completeHandler: null|void|(() => void)) {
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
