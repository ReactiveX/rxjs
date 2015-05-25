import Observer from './observer';
import Subscription from '../subscription/subscription';

export default class MapObserver<T> extends Observer<T> {
  private _projection:(any) => T;
  
  constructor(projection:(any) => T, generator:Generator<any>, subscriptionRef:Subscription) {
    super(generator, subscriptionRef);
    this._projection = projection;
  }

  next(value:any) : IteratorResult<T>{
    var newValue;
    try {
      newValue = this._projection(value);
    } catch(err) {
      super.throw(this);
    }
    return super.next(newValue);
  }
}