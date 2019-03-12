import { Operator } from '../Operator';
import { async } from '../scheduler/async';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { isScheduler } from '../util/isScheduler';
import { OperatorFunction, SchedulerLike } from '../types';

/* tslint:disable:max-line-length */
export function bufferTime<T>(bufferTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
export function bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number | null | undefined, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
export function bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number | null | undefined, maxBufferSize: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
/* tslint:enable:max-line-length */

/**
 * Buffers the source Observable values for a specific time period.
 *
 * <span class="informal">Collects values from the past as an array, and emits
 * those arrays periodically in time.</span>
 *
 * ![](bufferTime.png)
 *
 * Buffers values from the source for a specific time duration `bufferTimeSpan`.
 * Unless the optional argument `bufferCreationInterval` is given, it emits and
 * resets the buffer every `bufferTimeSpan` milliseconds. If
 * `bufferCreationInterval` is given, this operator opens the buffer every
 * `bufferCreationInterval` milliseconds and closes (emits and resets) the
 * buffer every `bufferTimeSpan` milliseconds. When the optional argument
 * `maxBufferSize` is specified, the buffer will be closed either after
 * `bufferTimeSpan` milliseconds or when it contains `maxBufferSize` elements.
 *
 * ## Examples
 *
 * Every second, emit an array of the recent click events
 *
 * ```javascript
 * import { fromEvent } from 'rxjs';
 * import { bufferTime } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferTime(1000));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * Every 5 seconds, emit the click events from the next 2 seconds
 *
 * ```javascript
 * import { fromEvent } from 'rxjs';
 * import { bufferTime } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferTime(2000, 5000));
 * buffered.subscribe(x => console.log(x));
 * ```
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
 * @param {number} [maxBufferSize] The maximum buffer size.
 * @param {SchedulerLike} [scheduler=async] The scheduler on which to schedule the
 * intervals that determine buffer boundaries.
 * @return {Observable<T[]>} An observable of arrays of buffered values.
 * @method bufferTime
 * @owner Observable
 */
export function bufferTime<T>(bufferTimeSpan: number): OperatorFunction<T, T[]> {
  let length: number = arguments.length;

  let scheduler: SchedulerLike = async;
  if (isScheduler(arguments[arguments.length - 1])) {
    scheduler = arguments[arguments.length - 1];
    length--;
  }

  let bufferCreationInterval: number = null;
  if (length >= 2) {
    bufferCreationInterval = arguments[1];
  }

  let maxBufferSize: number = Number.POSITIVE_INFINITY;
  if (length >= 3) {
    maxBufferSize = arguments[2];
  }

  return function bufferTimeOperatorFunction(source: Observable<T>) {
    return source.lift(new BufferTimeOperator<T>(bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler));
  };
}

class BufferTimeOperator<T> implements Operator<T, T[]> {
  constructor(private bufferTimeSpan: number,
              private bufferCreationInterval: number,
              private maxBufferSize: number,
              private scheduler: SchedulerLike) {
  }

  call(subscriber: Subscriber<T[]>, source: any): any {
    const { bufferCreationInterval, bufferTimeSpan, scheduler } = this;
    const timeSpanOnly = bufferCreationInterval == null || bufferCreationInterval < 0;

    const innerSubscription = new Subscription();
    const bufferTimeSubscriber = new BufferTimeSubscriber(subscriber, bufferTimeSpan, this.maxBufferSize, scheduler, timeSpanOnly);
    const subscription = source.subscribe(bufferTimeSubscriber);
    const context = bufferTimeSubscriber.openContext();
    context.innerSubscription = innerSubscription;
    bufferTimeSubscriber.add(innerSubscription);
    if (timeSpanOnly) {
      const timeSpanOnlyState = { subscriber: bufferTimeSubscriber, context, bufferTimeSpan, scheduler };
      innerSubscription.add(
          scheduler.schedule<DispatchBufferTimeSpanOnlyArg<T>>(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
    } else {
      const closeState = { subscriber: bufferTimeSubscriber, context };
      const creationState: DispatchCreateArg<T> = { bufferTimeSpan, bufferCreationInterval, subscriber: bufferTimeSubscriber, scheduler };
      innerSubscription.add(scheduler.schedule<DispatchCloseArg<T>>(dispatchBufferClose, bufferTimeSpan, closeState));
      bufferTimeSubscriber.add(scheduler.schedule<DispatchCreateArg<T>>(dispatchBufferCreation, bufferCreationInterval, creationState));
    }

    return subscription;
  }
}

class Context<T> {
  buffer: T[] = [];
  innerSubscription: Subscription;
}

interface DispatchCreateArg<T> {
  bufferTimeSpan: number;
  bufferCreationInterval: number;
  subscriber: BufferTimeSubscriber<T>;
  scheduler: SchedulerLike;
}

interface DispatchCloseArg<T> {
  subscriber: BufferTimeSubscriber<T>;
  context: Context<T>;
}

interface DispatchBufferTimeSpanOnlyArg<T> {
  subscriber: BufferTimeSubscriber<T>;
  scheduler: SchedulerLike;
  context: Context<T>;
  bufferTimeSpan: number;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class BufferTimeSubscriber<T> extends Subscriber<T> {
  private contexts: Array<Context<T>> = [];

  constructor(
    destination: Subscriber<T[]>,
    private bufferTimeSpan: number,
    private maxBufferSize: number,
    private scheduler: SchedulerLike,
    private timespanOnly: boolean,
  ) {
    super(destination);
  }

  protected _next(value: T) {
    const contexts = this.contexts;
    const len = contexts.length;
    let filledBufferContext: Context<T>;
    for (let i = 0; i < len; i++) {
      const context = contexts[i];
      const buffer = context.buffer;
      buffer.push(value);
      if (buffer.length == this.maxBufferSize) {
        filledBufferContext = context;
      }
    }

    if (filledBufferContext) {
      this.onBufferFull(filledBufferContext);
    }
  }

  protected _error(err: any) {
    this.contexts.length = 0;
    super._error(err);
  }

  protected _complete() {
    const { contexts, destination } = this;
    while (contexts.length > 0) {
      const context = contexts.shift();
      destination.next(context.buffer);
    }
    super._complete();
  }

  protected onBufferFull(context: Context<T>) {
    this.closeContext(context);
    const closeAction = context.innerSubscription;
    closeAction.unsubscribe();
    this.remove(closeAction);

    if (!this.closed && this.timespanOnly) {
      context = this.openContext();
      const { bufferTimeSpan, scheduler } = this;
      const timeSpanOnlyState = { subscriber: this, context, bufferTimeSpan, scheduler };
      this.add(
        context.innerSubscription =
          this.scheduler.schedule<DispatchBufferTimeSpanOnlyArg<T>>(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
    }
  }

  openContext(): Context<T> {
    const context: Context<T> = new Context<T>();
    this.contexts.push(context);
    return context;
  }

  closeContext(context: Context<T>) {
    this.destination.next(context.buffer);
    const contexts = this.contexts;

    const spliceIndex = contexts ? contexts.indexOf(context) : -1;
    if (spliceIndex >= 0) {
      contexts.splice(contexts.indexOf(context), 1);
    }
  }
}

function dispatchBufferTimeSpanOnly<T>(state: DispatchBufferTimeSpanOnlyArg<T>) {
  const { subscriber, scheduler } = state;

  const prevContext = state.context;
  if (prevContext) {
    subscriber.closeContext(prevContext);
  }

  if (!subscriber.closed) {
    state.context = subscriber.openContext();
    state.context.innerSubscription = scheduler.schedule<DispatchBufferTimeSpanOnlyArg<T>>(dispatchBufferTimeSpanOnly, state.bufferTimeSpan, state);
    subscriber.add(state.context.innerSubscription);
  }
}

function dispatchBufferCreation<T>(state: DispatchCreateArg<T>) {
  const { bufferCreationInterval, bufferTimeSpan, subscriber, scheduler } = state;
  const context = subscriber.openContext();
  if (!subscriber.closed) {
    subscriber.add(context.innerSubscription = scheduler.schedule<DispatchCloseArg<T>>(dispatchBufferClose, bufferTimeSpan, { subscriber, context }));
    subscriber.add(scheduler.schedule<DispatchCreateArg<T>>(dispatchBufferCreation, bufferCreationInterval, state));
  }
}

function dispatchBufferClose<T>(arg: DispatchCloseArg<T>) {
  const { subscriber, context } = arg;
  subscriber.closeContext(context);
}
