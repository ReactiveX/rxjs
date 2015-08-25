import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';

export default function retry<T>(count: number = 0): Observable<T> {
  return this.lift(new RetryOperator(count, this));
}

export class RetryOperator<T, R> extends Operator<T, R> {
  constructor(private count: number, protected original:Observable<T>) {
    super();
  }

  call(observer: Observer<T>): Observer<T> {
    return new RetrySubscriber<T>(observer, this.count, this.original);
  }
}

export class RetrySubscriber<T> extends Subscriber<T> {
  private retries: number = 0;
  constructor(destination: Observer<T>, private count: number, private original: Observable<T>) {
    super(destination);
  }
  
  _error(err: any) {
    const count = this.count;
    if (count && count === (this.retries+=1)){
      this.destination.error(err);
    } else { 
      this.resubscribe();
    } 
  }
  
  resubscribe() {
    this.original.subscribe(this);
  }
}