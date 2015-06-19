import Observable from '../Observable';
import Observer from '../Observer';

class RangeObservable extends Observable {
	end:number;
	start:number;
	
	constructor(start:number, end:number) {
		super(null);
    this.end = end;
    this.start = start;
	}
	
	subscriber(observer:Observer) {
    var end = this.end;
    var start = this.start;
    var i;
    for(i = start; i < end && !observer.disposed; i++) {
      observer.next(i);
    }
    observer.return();
	}
}

export default function range(start:number=0, end:number=0):Observable {
    return new RangeObservable(
        Math.min(start, end),
        Math.max(start, end)
    );
};