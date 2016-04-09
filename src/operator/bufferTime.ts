import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {Action} from '../scheduler/Action';
import {async} from '../scheduler/async';

/**
 * Buffers the source Observable values for a specific time period.
 *
 * <span class="informal">Collects values from the past as an array, and emits
 * those arrays periodically in time.</span>
 *
 * <img src="./img/bufferTime.png" width="100%">
 *
 * Buffers values from the source for a specific time duration `bufferTimeSpan`.
 * Unless the optional argument `bufferCreationInterval` is given, it emits and
 * resets the buffer every `bufferTimeSpan` milliseconds. If
 * `bufferCreationInterval` is given, this operator opens the buffer every
 * `bufferCreationInterval` milliseconds and closes (emits and resets) the
 * buffer every `bufferTimeSpan` milliseconds.
 *
 * @example <caption>Every second, emit an array of the recent click events</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var buffered = clicks.bufferTime(1000);
 * buffered.subscribe(x => console.log(x));
 *
 * @example <caption>Every 5 seconds, emit the click events from the next 2 seconds</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var buffered = clicks.bufferTime(2000, 5000);
 * buffered.subscribe(x => console.log(x));
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link windowTime}
 *
 * @param {number} bufferTimeSpan The amount of time to fill each buffer array.
 * @param {number} [bufferCreationInterval] The interval at which to start new
 * buffers.
 * @param {Scheduler} [scheduler=async] The scheduler on which to schedule the
 * intervals that determine buffer boundaries.
 * @return {Observable<T[]>} An observable of arrays of buffered values.
 * @method bufferTime
 * @owner Observable
 */
export function bufferTime<T>(bufferTimeSpan: number,
                              bufferCreationInterval: number = null,
                              scheduler: Scheduler = async): Observable<T[]> {
  return this.lift(new BufferTimeOperator<T>(bufferTimeSpan, bufferCreationInterval, scheduler));
}

export interface BufferTimeSignature<T> {
  (bufferTimeSpan: number, bufferCreationInterval?: number, scheduler?: Scheduler): Observable<T[]>;
}

class BufferTimeOperator<T> implements Operator<T, T[]> {
  constructor(private bufferTimeSpan: number,
              private bufferCreationInterval: number,
              private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T[]>, source: any): any {
    return source._subscribe(new BufferTimeSubscriber(
      subscriber, this.bufferTimeSpan, this.bufferCreationInterval, this.scheduler
    ));
  }
}

type CreationState<T> = {
  bufferTimeSpan: number;
  bufferCreationInterval: number,
  subscriber: BufferTimeSubscriber<T>;
  scheduler: Scheduler;
};

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class BufferTimeSubscriber<T> extends Subscriber<T> {
  private buffers: Array<T[]> = [];

  constructor(destination: Subscriber<T[]>,
              private bufferTimeSpan: number,
              private bufferCreationInterval: number,
              private scheduler: Scheduler) {
    super(destination);
    const buffer = this.openBuffer();
    if (bufferCreationInterval !== null && bufferCreationInterval >= 0) {
      const closeState = { subscriber: this, buffer };
      const creationState: CreationState<T> = { bufferTimeSpan, bufferCreationInterval, subscriber: this, scheduler };
      this.add(scheduler.schedule(dispatchBufferClose, bufferTimeSpan, closeState));
      this.add(scheduler.schedule(dispatchBufferCreation, bufferCreationInterval, creationState));
    } else {
      const timeSpanOnlyState = { subscriber: this, buffer, bufferTimeSpan };
      this.add(scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
    }
  }

  protected _next(value: T) {
    const buffers = this.buffers;
    const len = buffers.length;
    for (let i = 0; i < len; i++) {
      buffers[i].push(value);
    }
  }

  protected _error(err: any) {
    this.buffers.length = 0;
    super._error(err);
  }

  protected _complete() {
    const { buffers, destination } = this;
    while (buffers.length > 0) {
      destination.next(buffers.shift());
    }
    super._complete();
  }

  protected _unsubscribe() {
    this.buffers = null;
  }

  openBuffer(): T[] {
    let buffer: T[] = [];
    this.buffers.push(buffer);
    return buffer;
  }

  closeBuffer(buffer: T[]) {
    this.destination.next(buffer);
    const buffers = this.buffers;
    buffers.splice(buffers.indexOf(buffer), 1);
  }
}

function dispatchBufferTimeSpanOnly(state: any) {
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

interface DispatchArg<T> {
  subscriber: BufferTimeSubscriber<T>;
  buffer: Array<T>;
}

function dispatchBufferCreation<T>(state: CreationState<T>) {
  const { bufferCreationInterval, bufferTimeSpan, subscriber, scheduler } = state;
  const buffer = subscriber.openBuffer();
  const action = <Action<CreationState<T>>>this;
  if (!subscriber.isUnsubscribed) {
    action.add(scheduler.schedule<DispatchArg<T>>(dispatchBufferClose, bufferTimeSpan, { subscriber, buffer }));
    action.schedule(state, bufferCreationInterval);
  }
}

function dispatchBufferClose<T>(arg: DispatchArg<T>) {
  const { subscriber, buffer } = arg;
  subscriber.closeBuffer(buffer);
}
