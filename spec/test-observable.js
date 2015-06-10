import { Observable } from 'src/observable/observable';
import VirtualScheduler from 'src/scheduler/virtual-scheduler';

export default class TestScenario {
  constructor(scheduler) {
    this._scheduler = scheduler || new VirtualScheduler();
    this._generators = [];
  }

  createColdObservable(...events) {
    var self = this;
    return new Observable(gen => {
      events.forEach(([delay, value]) => {
        if(value instanceof Error) {
          self._scheduler.schedule(delay, value, (scheduler, value) => gen.throw(value));
        } else {
          self._scheduler.schedule(delay, value, (scheduler, value) => gen.next(value));
        }
      });
      self._generators.push(gen);
    });
  }

  run() {
    this._scheduler.flush();
    this._generators.forEach(gen => gen.return());
    this._generators.length = 0;
  }
}