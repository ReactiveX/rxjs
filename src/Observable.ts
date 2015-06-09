import Observer from './Observer';
import OperatorObservable from './OperatorObservable';

export default class Observable extends OperatorObservable {
  constructor(subscribe:(observer:Observer) => any) {
    super(<OperatorObservable>{ subscribe: subscribe });
  }
}