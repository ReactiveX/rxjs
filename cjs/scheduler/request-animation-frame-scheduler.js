"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RequestAnimationFrameScheduler = (function () {
    function RequestAnimationFrameScheduler() {
        _classCallCheck(this, RequestAnimationFrameScheduler);

        this._timeouts = [];
    }

    _createClass(RequestAnimationFrameScheduler, [{
        key: "schedule",
        value: function schedule(delay, state, work) {
            var argsLen = arguments.length;
            if (argsLen === 2) {
                work = state;
                state = delay;
                delay = 0;
            } else if (argsLen === 1) {
                work = delay;
                state = undefined;
                delay = 0;
            }
            if (delay === 0) {
                requestAnimationFrame(function () {
                    work(self, state);
                });
            } else if (delay > 0) {
                var self = this;
                var id = setTimeout(function () {
                    requestAnimationFrame(function () {
                        work(self, state);
                    });
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

    return RequestAnimationFrameScheduler;
})();

exports["default"] = RequestAnimationFrameScheduler;
module.exports = exports["default"];

//# sourceMappingURL=request-animation-frame-scheduler.js.map