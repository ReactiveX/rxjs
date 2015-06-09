import OperatorObservable from './OperatorObservable';
import Observable from './Observable';
import Observer from './Observer';
import Scheduler from './Scheduler';

import value from './observable/value';

class RxLiteMixin {
  value:(value:any,scheduler:Scheduler)=>OperatorObservable;
  return:(value:any,scheduler:Scheduler)=>OperatorObservable;
}

RxLiteMixin.prototype.value = value;
RxLiteMixin.prototype.return = value;

applyMixins(OperatorObservable, [RxLiteMixin]);

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