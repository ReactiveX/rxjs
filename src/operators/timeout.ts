import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Scheduler from '../Scheduler';
import immediate from '../schedulers/immediate';
import Subscription from '../Subscription';
import isDate from '../util/isDate';

export default function timeout(due: number|Date, errorToSend: any = null, scheduler: Scheduler = immediate) {
  let waitFor = isDate(due) ? (+due - Date.now()) : <number>due;
  return this.lift(new TimeoutOperator(waitFor, errorToSend, scheduler));
}

class TimeoutOperator<T, R> implements Operator<T, R> {
  constructor(private waitFor: number, private errorToSend: any, private scheduler: Scheduler) { 
  }
  
  call(subscriber: Subscriber<R>) {
    return new TimeoutSubscriber(subscriber, this.waitFor, this.errorToSend, this.scheduler);
  }
}

class TimeoutSubscriber<T> extends Subscriber<T> {
  timeoutSubscription: Subscription<any>;
  
  constructor(destination: Observer<T>, private waitFor: number, private errorToSend: any, private scheduler: Scheduler) {
    super(destination);
    let delay = waitFor;
    scheduler.schedule(dispatchTimeout, delay, { subscriber: this });
  }
  
  sendTimeoutError() {
    this.error(this.errorToSend || new Error('timeout'));
  }
}

function dispatchTimeout<T>(state: { subscriber: TimeoutSubscriber<T> }) {
  const subscriber = state.subscriber;
  subscriber.sendTimeoutError();
}