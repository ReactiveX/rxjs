import Scheduler from './scheduler';

/**
  Current frame scheduler. (aka Zalgo scheduler)
 */
export default class CurrentFrameScheduler implements Scheduler {
  private _timeouts:Array<any>

  constructor() {
    this._timeouts = [];
  }

  schedule(delay:Number, state:any, work:Function) {
    if(delay === 0) {
      // if no delay, do it now.
      // TODO: what to do with the return?
      work(this, state);
    }
    else if(delay > 0) {
      var self = this;
      var id = setTimeout(() => {
        work(self, state);
      }, delay);
      this._timeouts.push(id);
    }
  }

  dispose() {
    while(this._timeouts.length) {
      clearTimeout(this._timeouts.shift());
    }
  }
}