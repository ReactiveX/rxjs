import { FSub, FSubType } from './types';

export function createSubscription() {
  let handlers: Array<() => void>;
  let isUnsubbed = false;

  return (type?: FSubType, handler?: () => void) => {
    switch (type) {
      case FSubType.ADD:
        handlers = handlers || [];
        handlers.push(handler);
        return isUnsubbed;
      case FSubType.REMOVE:
        if (handlers) {
          const i = handlers.indexOf(handler);
          if (i !== -1) {
            handlers.splice(i, 1);
          }
        }
        return isUnsubbed;
      case FSubType.CHECK:
        return isUnsubbed;
      case FSubType.UNSUB:
      default:
        isUnsubbed = true;
        if (handlers) {
          while (handlers.length > 0) {
            handlers.shift()();
          }
        }
        return isUnsubbed;
    }
  };
}