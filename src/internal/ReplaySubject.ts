import { Subject } from 'rxjs/internal/Subject';
import { SchedulerLike } from 'rxjs/internal/types';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';
import { NOW_ONLY_SCHEDULER } from 'rxjs/internal/scheduler/now_only';

interface ReplayEvent<T> {
  value: T;
  timestamp: number;
}

export class ReplaySubject<T> extends Subject<T> {
  private _buffer: ReplayEvent<T>[] = [];

  constructor(
    private _bufferSize: number = Number.POSITIVE_INFINITY,
    private _windowTime: number = Number.POSITIVE_INFINITY,
    private _scheduler: SchedulerLike = NOW_ONLY_SCHEDULER
  ) {
    super();
  }

  protected _init(mut: MutableSubscriber<T>) {
    this._cleanBuffer();
    for (let { value } of this._buffer) {
      mut.next(value);
    }
    return super._init(mut);
  }

  next(value: T) {
    const { _buffer, _scheduler } = this;
    const timestamp = _scheduler.now();
    _buffer.push({ value, timestamp });
    this._cleanBuffer();
    super.next(value);
  }

  private _cleanBuffer() {
    const { _buffer, _scheduler, _bufferSize, _windowTime } = this;
    const now = _scheduler.now();

    if (_bufferSize < Number.POSITIVE_INFINITY) {
      _buffer.splice(0, _buffer.length - _bufferSize);
    }

    if (_windowTime < Number.POSITIVE_INFINITY) {
      const cutoff = now - _windowTime;
      let i = 0;
      while (i < _buffer.length && _buffer[i].timestamp < cutoff) {
        i++;
      }
      _buffer.splice(0, i);
    }
  }
}
