import { Subscription } from '../Subscription';
import { asyncScheduler } from '../scheduler/asyncScheduler';
import { SchedulerLike } from '../types';

export interface QueueSchedulerCtor {
  new(): QueueScheduler;
}

export interface QueueScheduler extends SchedulerLike {
}

function QueueSchedulerImpl(this: any) {
  this._flushing = false;
  this._queue = [];
}

const proto = QueueSchedulerImpl.prototype;

proto.now = function () {
  return Date.now();
};

proto.schedule = function<T>(work: (state: T) => void, delay = 0, state = undefined as T, subs?: Subscription): Subscription {
  subs = subs || new Subscription();
  if (delay > 0) {
    return asyncScheduler.schedule(work, delay, state, subs);
  }
  const queue = this._queue;
  subs.add(() => {
    const i = queue.indexOf(work);
    queue.splice(i, 2);
  });
  queue.push(work, state);
  if (!this._flushing) {
    this._flushing = true;
    while (queue.length > 0) {
      queue.shift()(queue.shift());
    }
    this._flushing = false;
  }
  return subs;
};

export const QueueScheduler: QueueSchedulerCtor = QueueSchedulerImpl as any;

export const queueScheduler: SchedulerLike = new QueueScheduler() as any;
