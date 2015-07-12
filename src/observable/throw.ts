import Observable from '../Observable';
import Observer from '../Observer';
import $$observer from '../util/Symbol_observer';

class ThrowObservable extends Observable {
  err:any;
  
  constructor(err:any) {
    super(null);
    this.err = err;
  }
  
  [$$observer](observer:Observer) {
    observer.error(this.err);
  }
}

const EMPTY_THROW = new ThrowObservable(undefined);

export default function _throw(err:any=undefined):Observable {
  return err ? new ThrowObservable(err) : EMPTY_THROW;
};
