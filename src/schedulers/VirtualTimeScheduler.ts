import Scheduler from '../Scheduler';
import Subscription from '../Subscription';
import Action from './Action';

export default class VirtualTimeScheduler implements Scheduler {
  actions: Action[] = [];
  active: boolean = false;
  scheduled: boolean = false;
  index: number = 0;
  sorted: boolean = false;
  frame: number = 0;
  maxFrames: number = 750;
  
  now() {
    return 0;
  }
  
  flush() {
    const actions = this.actions;
    const maxFrames = this.maxFrames;
    while (actions.length > 0) {
      let action = actions.shift();
      this.frame = action.delay;
      if(this.frame <= maxFrames) {
        action.execute();
      } else {
        break;
      }
    }
    actions.length = 0;
    this.frame = 0;
  }
  
  addAction<T>(action: Action) {
    const findDelay = action.delay;
    const actions = this.actions;
    const len = actions.length;
    const vaction = <VirtualAction<T>>action;
    
    
    actions.push(action);
    
    actions.sort((a:VirtualAction<T>, b:VirtualAction<T>) => {
      return (a.delay === b.delay) ? (a.index === b.index ? 0 : (a.index > b.index ? 1 : -1)) : (a.delay > b.delay ? 1 : -1);
    });
  }

  schedule<T>(work: (x?: any) => Subscription<T> | void, delay: number = 0, state?: any): Subscription<T> {
    this.sorted = false;
    return new VirtualAction(this, work, this.index++).schedule(state, delay);
  }
}

class VirtualAction<T> extends Subscription<T> implements Action {
  state: any;
  delay: number;
  
  constructor(public scheduler: VirtualTimeScheduler,
    public work: (x?: any) => Subscription<T> | void,
    public index: number) {
    super();
  }

  schedule(state?: any, delay: number = 0): VirtualAction<T> {
    if (this.isUnsubscribed) {
      return this;
    }
    const scheduler = this.scheduler;
    var action = scheduler.frame === this.delay ? this :
      new VirtualAction(scheduler, this.work, scheduler.index += 1);
    action.state = state;
    action.delay = scheduler.frame + delay;
    scheduler.addAction(action);
    return this;
  }

  execute() {
    if (this.isUnsubscribed) {
      throw new Error("How did did we execute a canceled Action?");
    }
    this.work(this.state);
  }

  unsubscribe() {
    const scheduler = this.scheduler;
    const actions = scheduler.actions;
    const index = actions.indexOf(this);

    this.work = void 0;
    this.state = void 0;
    this.scheduler = void 0;

    if (index !== -1) {
      actions.splice(index, 1);
    }

    super.unsubscribe();
  }
}