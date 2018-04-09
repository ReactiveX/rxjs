import { FObs, FOType, FOArg, FSub, FSubType, Observer, SubscriptionLike } from '../types';
import { createSubscription } from '../util/createSubscription';
import { Observable } from '../observable/Observable';
import { rxFObs } from '../util/symbols';
import { noop } from '../util/noop';

export function fSub<T>() {
  let _state: Array<any> = [];
  let _closed = false;

  return (type: FOType, arg: FOArg<T>, subs: FSub) => {
    if (type === FOType.SUBSCRIBE) {
      _state.push(arg, subs);
    } else {
      if (!_closed) {
        for (let i = 0; i < _state.length; i += 2) {
          _state[i](type, arg, _state[i + 1]);
        }
      }
      if (type !== FOType.NEXT) {
        _closed = true;
        while (_state.length > 0) {
          _state.shift();
          _state.shift()();
        }
        _state = undefined;
      }
    }
  };
}

export class Subject<T> extends Observable<T> implements Observer<T> {
  constructor() {
    super();
    this[rxFObs] = fSub<T>();
  }

  next(value: T, subscription: SubscriptionLike) {
    this[rxFObs](FOType.NEXT, value, subscriptionToFSub(subscription));
  }

  error(err: any) {
    this[rxFObs](FOType.ERROR, err, noop);
  }

  complete() {
    this[rxFObs](FOType.COMPLETE, undefined, noop);
  }
}

function subscriptionToFSub(subscription: SubscriptionLike): FSub {
  return (type?: FSubType) => {
    if (type === FSubType.UNSUB || !type) {
      subscription.unsubscribe();
      return true;
    }
    return false; // HACK: this might be wrong.
  };
}
