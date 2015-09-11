import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

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
  
  constructor(destination: Observer<T>, private bufferSize: number, private startBufferEvery: number) {
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
        this.destination.next(buffer);
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
      var buffer = buffers.shift();
      if (buffer.length > 0) {
        destination.next(buffer);
      }
    }
    destination.complete();
  }
}