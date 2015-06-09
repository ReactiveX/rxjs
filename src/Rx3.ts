import OperatorObservable from './OperatorObservable';
import Observable from './Observable';
import Observer from './Observer';
import Scheduler from './Scheduler';

import value from './observable/value';

import select from './operator/select';

OperatorObservable.value = value;
OperatorObservable.return = value;

OperatorObservable.prototype.select = select;
OperatorObservable.prototype.map = select;

var Rx3 = {
  Observable,
  Scheduler,
  Observer,
  OperatorObservable
};

export default {
  Rx3: Rx3
}

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        })
    }); 
}