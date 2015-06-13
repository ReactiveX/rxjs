import Observable from '../Observable';
import Scheduler from '../Scheduler';
import Observer from '../Observer';

class RangeObservable extends Observable {
	scheduler:Scheduler;
	end:number;
	start:number;
	
	constructor(start:number, end:number, scheduler:Scheduler) {
		super(null);
    this.end = end;
    this.start = start;
    this.scheduler = scheduler;
	}
	
	_subscribe(observer:Observer) {
    var end = this.end;
    var start = this.start - 1;
    var scheduler = this.scheduler;

    if (scheduler) {
        return scheduler.schedule(0, [{ done: false }, observer, start, end], dispatch);
    }

    while (++start < end) {
        var result = observer.next(start);
        if (result.done) {
            return;
        }
    }
    observer["return"]();	
	}
}

function dispatch(state) {
    var result = state[0];
    var observer = state[1];
    var end = state[3];
    var start = state[2];
    if (++start < end) {
        result = observer.next(start);
        if (!result.done) {
            state[0] = result;
            state[2] = start;
            this.reschedule(state);
        }
    } else if (!result.done) {
        observer["return"]();
    }
}

export default function range(start:number, end:number, scheduler:Scheduler=Scheduler.immediate):Observable {
    return new RangeObservable(
        Math.min(start || (start = 0), end || (end = 0)),
        Math.max(start, end),
        scheduler
    );
};