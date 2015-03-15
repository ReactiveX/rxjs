import Observable from './observable';
import MapObserver from '../observer/map-observer';

export default class MapObservable extends Observable {
  constructor(source, projectionFn) {
    this._projectionFn = projectionFn;
    this._source = source;
  }
  
  _observer(/*generator*/) {
    var subscriptionReference = {};
    subscriptionReference.value = this._source.observer(new MapObserver(this._projectionFn, this._generator, subscriptionReference));
    return subscriptionReference.value;
  }
}