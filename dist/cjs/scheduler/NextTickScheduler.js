'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Scheduler2 = require('./Scheduler');

var _Scheduler3 = _interopRequireDefault(_Scheduler2);

var _SchedulerActions = require('./SchedulerActions');

var NextTickScheduler = (function (_Scheduler) {
    function NextTickScheduler() {
        _classCallCheck(this, NextTickScheduler);

        if (_Scheduler != null) {
            _Scheduler.apply(this, arguments);
        }
    }

    _inherits(NextTickScheduler, _Scheduler);

    NextTickScheduler.prototype.scheduleNow = function scheduleNow(state, work) {
        var action = this.scheduled ? new _SchedulerActions.ScheduledAction(this, state, work) : new _SchedulerActions.NextScheduledAction(this, state, work);
        action.schedule();
        return action;
    };

    return NextTickScheduler;
})(_Scheduler3['default']);

exports['default'] = NextTickScheduler;
module.exports = exports['default'];