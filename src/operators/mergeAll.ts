import Observable from '../Observable';
import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observer from '../Observer';
import Subscription from '../Subscription';

export default function mergeAll<R>(concurrent: number = Number.POSITIVE_INFINITY): Observable<R> {
  return this.lift(new MergeAllOperator(concurrent));
}

class MergeAllOperator<T, R> implements Operator<T, R> {
  constructor(private concurrent: number) {
    
  }
  
  call(observer: Observer<T>) {
    return new MergeAllSubscriber(observer, this.concurrent);
  }
}

class MergeAllSubscriber<T> extends Subscriber<T> {
  private hasCompleted: boolean = false;
  private buffer: Observable<any>[] = [];
  private active: number = 0;
  constructor(destination: Observer<T>, private concurrent:number) {
    super(destination);
  }
  
  _next(value: any) {
    if(this.active < this.concurrent) {
      const innerSub = new Subscription();
      this.add(innerSub);
      this.active++;
      innerSub.add(value.subscribe(new MergeAllInnerSubscriber(this.destination, this, innerSub)));
    } else {
      this.buffer.push(value);
    }
  }
  
  _complete() {
    this.hasCompleted = true;
    if(this.active === 0 && this.buffer.length === 0) {
      this.destination.complete();
    }
  }
  
  notifyComplete(innerSub: Subscription<T>) {
    const buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if(buffer.length > 0) {
      this._next(buffer.shift());
    } else if (this.active === 0 && this.hasCompleted) {
      this.destination.complete();
    }
  }
}

class MergeAllInnerSubscriber<T> extends Subscriber<T> {
  constructor(destination: Observer<T>, private parent: MergeAllSubscriber<T>, 
    private innerSub: Subscription<T> ) {
    super(destination);
  }
  
  _complete() {
    this.parent.notifyComplete(this.innerSub);
  }
}