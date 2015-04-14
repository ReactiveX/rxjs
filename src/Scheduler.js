var Disposable = require("src/Disposable");
var Immediate = require("src/support/Immediate");

var Scheduler = function() {
    
    function Scheduler(async) {
        this.async = async || false;
        this.active = false;
        this.scheduled = false;
        this.length = 0;
    }
    
    Scheduler.prototype.schedule = function(delay, state, work) {
        
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
            if(this.async) {
                scheduleNext(this, state, work);
            } else {
                scheduleNow(this, state, work);
            }
        } else {
            scheduleLater(this, delay, state, work);
        }
    };
    
    function scheduleNow(scheduler, state, work) {
        function act() {
            disposable.dispose();
            return work(scheduler, state);
        }
        var uuid = scheduler.length++;
        var actions = scheduler.actions || (scheduler.actions = []);
        var disposable = new Disposable(function() {
            delete actions[uuid];
            --scheduler.length;
        });
        actions[uuid] = act;
        flush(scheduler);
        return disposable;
    }
    
    function scheduleNext(scheduler, state, work) {
        
        var disposable;
        
        if(!scheduler.scheduled) {
            
            scheduler.active = true;
            scheduler.scheduled = true;
            
            var id = Immediate.setImmediate(function () {
                scheduler.scheduled = false;
                scheduler.active = false;
                flush(scheduler);
            });
            
            disposable = new Disposable(function () {
                if(id != null) {
                    Immediate.clearImmediate(id);
                    id = undefined;
                }
            });
            
            scheduler.add(disposable.add(scheduleNow(scheduler, state, work)));
        } else {
            disposable = scheduleNow(scheduler, state, work);
        }
        
        return disposable;
    }
    
    function scheduleLater(scheduler, delay, state, work) {
        var disposable = Disposable.empty;
        var id = setTimeout(function() {
            id = undefined;
            disposable = scheduler.schedule(state, work);
        }, delay);
        return new Disposable(function() {
            disposable.dispose();
            if(id != null) {
                clearTimeout(id);
                id = undefined;
            }
        });
    }
    
    function flush(scheduler) {
        var actions;
        if(!scheduler.active && (actions = scheduler.actions)) {
            scheduler.active = true;
            while(scheduler.length > 0) {
                actions[scheduler.length - 1]();
            }
            scheduler.active = false;
        }
    }
    
    Scheduler.immediate = new Scheduler();
    Scheduler.scheduler = new Scheduler(true);
    
    return Scheduler;
}();

module.exports = Scheduler;