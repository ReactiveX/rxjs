import OperatorObservable from './OperatorObservable';
import Observable from './Observable';
import Observer from './Observer';
import Scheduler from './Scheduler';

import value from './observable/value';

OperatorObservable.prototype.value = value;
OperatorObservable.prototype.return = value;

var Rx3 = {
  Observable,
  Scheduler,
  Observer,
  OperatorObservable
};

export default {
  Rx3: Rx3
}