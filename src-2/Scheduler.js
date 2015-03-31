import Disposable from './Disposable';
import Immediate from './support/Immediate';

class Action extends Disposable {
    constructor(work, state) {
        this.work = work;
        this.state = state;
    }
    
    _dispose() {
        this.work = null;
        this.state = null;
    }
}

class Scheduler extends Disposable {
    
    constructor(async) {
        this.async = async || false;
        this.active = false;
        this.scheduled = false;
    }
    
    schedule(delay, state, work) {
        
        var self = this;
        var argsLen = arguments.length;
        var disposable;
        
        if(argsLen == 2) {
            work  = state;
            state = delay;
            delay = 0;
        } else if(argsLen == 1) {
            work  = delay;
            state = undefined,
            delay = 0;
        }
        
        if(delay <= 0) {
            
            var actions = this._actions || (this._actions = []);
            
            this.add(disposable = () => {
                var action = new Action(work, state);
                var index  = actions.length;
                actions[index] = action;
                return action.add(new Disposable(() => {
                    actions[index] = undefined;
                }));
            }());
            
            if(!!this.async) {
                if(!this.scheduled) {
                    this.scheduled = true;
                    this.add(disposable.add(() => {
                        var id = Immediate.setImmediate(() => {
                            self.scheduled = false;
                            self.flush();
                        });
                        return new Disposable(() => {
                            if(id != null) {
                                Immediate.clearImmediate(id);
                                id = undefined;
                            }
                        });
                    }()));
                }
            } else if(!self.active) {
                this.flush();
            }
        } else {
            this.add(disposable = () => {
                var id = setTimeout(delay, () => {
                    work(self, state);
                });
                return new Disposable(() => {
                    if(id != null) {
                        clearTimeout(id);
                        id = undefined;
                    }
                })
            }());
        }
        return disposable;
    }
    
    flush() {
        this.active = true;
        var actions = this._actions;
        if(actions) {
            var count = -1, action;
            while(++count < actions.length) {
                action = actions[count];
                action.work(this, action.state);
                action.dispose();
            }
            actions.length = 0;
            this._actions = undefined;
        }
        this.active = false;
    }
}

Scheduler.async     = new Scheduler(true);
Scheduler.scheduler = new Scheduler();

export default Scheduler;