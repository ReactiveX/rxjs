define(["exports", "module"], function (exports, module) {
    "use strict";

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Task = function Task(delay, state, work, scheduler) {
        _classCallCheck(this, Task);

        this.delay = delay;
        this.state = state;
        this.work = work;
        this.scheduler = scheduler;
    };

    module.exports = Task;
});

//# sourceMappingURL=task.js.map