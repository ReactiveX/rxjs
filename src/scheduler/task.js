var Task = (function () {
    function Task(delay, state, work, scheduler) {
        this.delay = delay;
        this.state = state;
        this.work = work;
        this.scheduler = scheduler;
    }
    return Task;
})();
exports.default = Task;
