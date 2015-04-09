export default class RequestAnimationFrameScheduler {
  constructor() {
    this._timeouts = [];
  }

  schedule(delay, state, work) {
    var argsLen = arguments.length;

    if(argsLen === 2) {
      work = state;
      state = delay;
      delay = 0;
    }
    else if(argsLen === 1) {
      work = delay;
      state = undefined;
      delay = 0;
    }

    if(delay === 0) {
      requestAnimationFrame(() => {
        work(self, state);
      });
    }
    else if(delay > 0) {
      var self = this;
      var id = setTimeout(() => {
        requestAnimationFrame(() => {
          work(self, state);
        });
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