"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
  Current frame scheduler. (aka Zalgo scheduler)
 */

var CurrentFrameScheduler = (function () {
    function CurrentFrameScheduler() {
        _classCallCheck(this, CurrentFrameScheduler);

        this._timeouts = [];
    }

    _createClass(CurrentFrameScheduler, [{
        key: "schedule",
        value: function schedule(delay, state, work) {
            if (delay === 0) {
                // if no delay, do it now.
                // TODO: what to do with the return?
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

    return CurrentFrameScheduler;
})();

exports["default"] = CurrentFrameScheduler;
module.exports = exports["default"];

//# sourceMappingURL=current-frame-scheduler.js.map