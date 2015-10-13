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

/**
 * buffers values from the source for a specific time period. Optionally allows new buffers to be set up at an interval.
 * @param {number} the amount of time to fill each buffer for before emitting them and clearing them.
 * @param {number} [bufferCreationInterval] the interval at which to start new buffers.
 * @param {Scheduler} [scheduler] (optional, defaults to `nextTick` scheduler) The scheduler on which to schedule the
 *  intervals that determine buffer boundaries.
 * @returns {Observable<T[]>} an observable of arrays of buffered values.
 */
export default function bufferTime<T>(bufferTimeSpan: number,
                                      bufferCreationInterval: number = null,
                                      scheduler: Scheduler = nextTick): Observable<T[]> {
  return this.lift(new BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, scheduler));
}

class BufferTimeOperator<T, R> implements Operator<T, R> {

  constructor(private bufferTimeSpan: number,
              private bufferCreationInterval: number,
              private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new BufferTimeSubscriber(
      subscriber, this.bufferTimeSpan, this.bufferCreationInterval, this.scheduler
    );
  }
}

class BufferTimeSubscriber<T> extends Subscriber<T> {
  private buffers: Array<T[]> = [];

  constructor(destination: Subscriber<T>,
              private bufferTimeSpan: number,
              private bufferCreationInterval: number,
              private scheduler: Scheduler) {
    super(destination);
    let buffer = this.openBuffer();
    if (bufferCreationInterval !== null && bufferCreationInterval >= 0) {
      const closeState = { subscriber: this, buffer };
      const creationState = { bufferTimeSpan, bufferCreationInterval, subscriber: this, scheduler };
      this.add(scheduler.schedule(dispatchBufferClose, bufferTimeSpan, closeState));
      this.add(scheduler.schedule(dispatchBufferCreation, bufferCreationInterval, creationState));
    } else {
      const timeSpanOnlyState = { subscriber: this, buffer, bufferTimeSpan };
      this.add(scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
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
  if (!subscriber.isUnsubscribed) {
    (<any>this).schedule(state, state.bufferTimeSpan);
  }
}

function dispatchBufferCreation(state) {
  let { bufferCreationInterval, bufferTimeSpan, subscriber, scheduler } = state;
  let buffer = subscriber.openBuffer();
  let action = <Action>this;
  if (!subscriber.isUnsubscribed) {
    action.add(scheduler.schedule(dispatchBufferClose, bufferTimeSpan, { subscriber, buffer }));
    action.schedule(state, bufferCreationInterval);
  }
}

function dispatchBufferClose({ subscriber, buffer }) {
  subscriber.closeBuffer(buffer);
}