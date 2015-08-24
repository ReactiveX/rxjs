import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function _finally<T>(finallySelector: () => void, thisArg?: any) {
  return this.lift(new FinallyOperator(thisArg ?
    <() => void> bindCallback(finallySelector, thisArg, 2) :
    finallySelector));
}

export class FinallyOperator<T, R> implements Operator<T, R> {

  finallySelector: () => void;

  constructor(finallySelector: () => void) {
    this.finallySelector = finallySelector;
  }

  call(observer: Observer<T>): Observer<T> {
    return new FinallySubscriber(observer, this.finallySelector);
  }
}

export class FinallySubscriber<T> extends Subscriber<T> {
  constructor(destination: Observer<T>, finallySelector: () => void) {
    super(destination);
    this.add(new Subscription(finallySelector));
  }
}
