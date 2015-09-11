import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subscription from '../Subscription';
import Scheduler from '../Scheduler';
import Action from '../schedulers/Action';
import nextTick from '../schedulers/nextTick';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number = null, scheduler: Scheduler = nextTick) : Observable<T[]> {
  return this.lift(new BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, scheduler));
}

class BufferTimeOperator<T, R> implements Operator<T, R> {

  constructor(private bufferTimeSpan: number, private bufferCreationInterval: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new BufferTimeSubscriber(subscriber, this.bufferTimeSpan, this.bufferCreationInterval, this.scheduler);
  }
}

class BufferTimeSubscriber<T> extends Subscriber<T> {
  private buffers: Array<T[]> = [];
  
  constructor(destination: Observer<T>, private bufferTimeSpan: number, private bufferCreationInterval: number, private scheduler: Scheduler) {
    super(destination);
    let buffer = this.openBuffer();
    if (bufferCreationInterval !== null && bufferCreationInterval >= 0) {
      this.add(scheduler.schedule(dispatchBufferClose, bufferTimeSpan, { subscriber: this, buffer }));
      this.add(scheduler.schedule(dispatchBufferCreation, bufferCreationInterval, { bufferTimeSpan, bufferCreationInterval, subscriber: this, scheduler }));
    } else {
      this.add(scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, { subscriber: this, buffer, bufferTimeSpan }));
    }
  }
  
  _next(value: T) {
    const buffers = this.buffers;
    const len = buffers.length;
    for (let i = 0; i < len; i++) {
      buffers[i].push(value);
    }
  }
  
  _error(err) {
    this.buffers.length = 0;
    this.destination.error(err);
  }
  
  _complete() {
    const buffers = this.buffers;
    while (buffers.length > 0) {
      this.destination.next(buffers.shift());
    }
    this.destination.complete();
  }
  
  openBuffer(): T[] {
    let buffer = [];
    this.buffers.push(buffer);
    return buffer;
  }
  
  closeBuffer(buffer: T[]) {
    this.destination.next(buffer);
    const buffers = this.buffers;
    buffers.splice(buffers.indexOf(buffer), 1);
  }
}

function dispatchBufferTimeSpanOnly(state) {
  const subscriber: BufferTimeSubscriber<any> = state.subscriber;

  const prevBuffer = state.buffer;
  if (prevBuffer) {
    subscriber.closeBuffer(prevBuffer);
  }
  
  state.buffer = subscriber.openBuffer();
  (<any>this).schedule(state, state.bufferTimeSpan);
}

function dispatchBufferCreation(state) {
  let {  bufferCreationInterval, bufferTimeSpan, subscriber, scheduler } = state;
  let buffer = subscriber.openBuffer();
  var action = <Action>this;
  action.add(scheduler.schedule(dispatchBufferClose, bufferTimeSpan, { subscriber, buffer }));
  action.schedule(state, bufferCreationInterval);
}

function dispatchBufferClose({ subscriber, buffer }) {
  subscriber.closeBuffer(buffer);
}