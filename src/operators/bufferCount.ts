import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observable from '../Observable';

/**
 * buffers a number of values from the source observable by `bufferSize` then emits the buffer and clears it, and starts a
 * new buffer each `startBufferEvery` values. If `startBufferEvery` is not provided or is `null`, then new buffers are
 * started immediately at the start of the source and when each buffer closes and is emitted.
 * @param {number} bufferSize the maximum size of the buffer emitted.
 * @param {number} [startBufferEvery] optional interval at which to start a new buffer. (e.g. if `startBufferEvery` is `2`,asdf then a
 *   new buffer will be started on every other value from the source.) A new buffer is started at the beginning of the source by default.
 * @returns {Observable<T[]>} an observable of arrays of buffered values.
 */
export default function bufferCount<T>(bufferSize: number, startBufferEvery: number = null): Observable<T[]> {
  return this.lift(new BufferCountOperator(bufferSize, startBufferEvery));
}

class BufferCountOperator<T, R> implements Operator<T, R> {

  constructor(private bufferSize: number, private startBufferEvery: number) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new BufferCountSubscriber(subscriber, this.bufferSize, this.startBufferEvery);
  }
}

class BufferCountSubscriber<T> extends Subscriber<T> {
  buffers: Array<T[]> = [[]];
  count: number = 0;

  constructor(destination: Subscriber<T>, private bufferSize: number, private startBufferEvery: number) {
    super(destination);
  }

  _next(value: T) {
    const count = (this.count += 1);
    const destination = this.destination;
    const bufferSize = this.bufferSize;
    const startBufferEvery = (this.startBufferEvery == null) ? bufferSize : this.startBufferEvery;
    const buffers = this.buffers;
    const len = buffers.length;
    let remove = -1;

    if (count % startBufferEvery === 0) {
      buffers.push([]);
    }

    for (let i = 0; i < len; i++) {
      let buffer = buffers[i];
      buffer.push(value);
      if (buffer.length === bufferSize) {
        remove = i;
        destination.next(buffer);
      }
    }

    if (remove !== -1) {
      buffers.splice(remove, 1);
    }
  }

  _error(err: any) {
    this.destination.error(err);
  }

  _complete() {
    const destination = this.destination;
    const buffers = this.buffers;
    while (buffers.length > 0) {
      let buffer = buffers.shift();
      if (buffer.length > 0) {
        destination.next(buffer);
      }
    }
    destination.complete();
  }
}