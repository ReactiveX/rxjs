define(["exports", "module"], function (exports, module) {
    /**
      Current frame scheduler. (aka Zalgo scheduler)
     */
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Scheduler = (function () {
        function Scheduler() {
            _classCallCheck(this, Scheduler);

            this._timeouts = [];
        }

        _createClass(Scheduler, [{
            key: "now",
            value: function now(state, work) {
                this.schedule(0, state, work);
            }
        }, {
            key: "schedule",
            value: function schedule(delay, state, work) {
                if (delay === 0) {
                    work(this, state);
                } else if (delay > 0) {
                    var self = this;
                    var id = setTimeout(function () {
                        work(self, state);
                    }, delay);
                    this._timeouts.push(id);
                }
            }
        }, {
            key: "dispose",
            value: function dispose() {
                while (this._timeouts.length) {
                    clearTimeout(this._timeouts.shift());
                }
            }
        }]);

        return Scheduler;
    })();

    module.exports = Scheduler;
});

//# sourceMappingURL=scheduler.js.map