import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {Action} from '../scheduler/Action';
import {asap} from '../scheduler/asap';

/**
 * Buffers values from the source for a specific time period. Optionally allows
 * new buffers to be set up at an interval.
 *
 * <img src="./img/bufferTime.png" width="100%">
 *
 * @param {number} bufferTimeSpan the amount of time to fill each buffer for
 * before emitting them and clearing them.
 * @param {number} [bufferCreationInterval] the interval at which to start new
 * buffers.
 * @param {Scheduler} [scheduler] (optional, defaults to `asap` scheduler) The
 * scheduler on which to schedule the intervals that determine buffer
 * boundaries.
 * @returns {Observable<T[]>} an observable of arrays of buffered values.
 */
export function bufferTime<T>(bufferTimeSpan: number,
                              bufferCreationInterval: number = null,
                              scheduler: Scheduler = asap): Observable<T[]> {
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

  call(subscriber: Subscriber<T[]>): Subscriber<T> {
    return new BufferTimeSubscriber(
      subscriber, this.bufferTimeSpan, this.bufferCreationInterval, this.scheduler
    );
  }
}

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
      const creationState = { bufferTimeSpan, bufferCreationInterval, subscriber: this, scheduler };
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

  _unsubscribe() {
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

function dispatchBufferCreation(state: any) {
  const { bufferCreationInterval, bufferTimeSpan, subscriber, scheduler } = state;
  const buffer = subscriber.openBuffer();
  const action = <Action>this;
  if (!subscriber.isUnsubscribed) {
    action.add(scheduler.schedule(dispatchBufferClose, bufferTimeSpan, { subscriber, buffer }));
    action.schedule(state, bufferCreationInterval);
  }
}

function dispatchBufferClose({ subscriber, buffer }) {
  subscriber.closeBuffer(buffer);
}
