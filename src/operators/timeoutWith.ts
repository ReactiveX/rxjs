import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Scheduler from '../Scheduler';
import Subscription from '../Subscription';
import Observable from '../Observable';
import isDate from '../util/isDate';

export default function timeoutWith(due: number|Date, withObservable: Observable<any>, scheduler: Scheduler = Scheduler.immediate) {
  let waitFor = isDate(due) ? (+due - Date.now()) : <number>due;
  return this.lift(new TimeoutWithOperator(waitFor, withObservable, scheduler));
}

class TimeoutWithOperator<T, R> implements Operator<T, R> {
  constructor(private waitFor: number, private withObservable: Observable<any>, private scheduler: Scheduler) { 
  }
  
  call(observer: Observer<R>) {
    return new TimeoutWithSubscriber(observer, this.waitFor, this.withObservable, this.scheduler);
  }
}

class TimeoutWithSubscriber<T> extends Subscriber<T> {
  timeoutSubscription: Subscription<any>;
  
  constructor(destination: Observer<T>, private waitFor: number, private withObservable: Observable<any>, private scheduler: Scheduler) {
    super(destination);
    let delay = waitFor;
    scheduler.schedule(delay, { subscriber: this }, dispatchTimeout);
  }
  
  handleTimeout() {
    const withObservable = this.withObservable;
    this.add(withObservable.subscribe(this));
  }
}

function dispatchTimeout<T>(state: { subscriber: TimeoutWithSubscriber<T> }) {
  const subscriber = state.subscriber;
  subscriber.handleTimeout();
}