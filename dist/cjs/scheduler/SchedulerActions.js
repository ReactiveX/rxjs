'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _SerialSubscription2 = require('../SerialSubscription');

var _SerialSubscription3 = _interopRequireDefault(_SerialSubscription2);

var _utilImmediate = require('../util/Immediate');

var _utilImmediate2 = _interopRequireDefault(_utilImmediate);

var _Subscription = require('../Subscription');

var _Subscription2 = _interopRequireDefault(_Subscription);

var ScheduledAction = (function (_SerialSubscription) {
    function ScheduledAction(scheduler, state, work) {
        _classCallCheck(this, ScheduledAction);

        _SerialSubscription.call(this, null);
        this.scheduler = scheduler;
        this.work = work;
        this.schedule(state);
    }

    _inherits(ScheduledAction, _SerialSubscription);

    ScheduledAction.prototype.schedule = function schedule(state) {
        var scheduler = this.scheduler;
        var actions = scheduler.actions;
        this.state = state;
        actions.push(this);
        scheduler.flush();
        return this;
    };

    ScheduledAction.prototype.reschedule = function reschedule(state) {
        return this.schedule(state);
    };

    ScheduledAction.prototype.execute = function execute() {
        if (this.unsubscribed) {
            throw new Error('How did did we execute a canceled ScheduledAction?');
        }
        this.add(_Subscription2['default'].from(this.work(this.state), this.observer));
    };

    ScheduledAction.prototype.unsubscribe = function unsubscribe() {
        _SerialSubscription.prototype.unsubscribe.call(this);
        var actions = this.scheduler.actions;
        var index = Array.isArray(actions) ? actions.indexOf(this) : -1;
        if (index !== -1) {
            actions.splice(index, 1);
        }
        this.work = void 0;
        this.state = void 0;
        this.scheduler = void 0;
    };

    return ScheduledAction;
})(_SerialSubscription3['default']);

exports.ScheduledAction = ScheduledAction;

var NextScheduledAction = (function (_ScheduledAction) {
    function NextScheduledAction() {
        _classCallCheck(this, NextScheduledAction);

        if (_ScheduledAction != null) {
            _ScheduledAction.apply(this, arguments);
        }
    }

    _inherits(NextScheduledAction, _ScheduledAction);

    NextScheduledAction.prototype.schedule = function schedule(state) {
        var self = this;
        var scheduler = this.scheduler;
        this.state = state;
        scheduler.actions.push(this);
        if (!scheduler.scheduled) {
            scheduler.active = true;
            scheduler.scheduled = true;
            this.id = _utilImmediate2['default'].setImmediate(function () {
                self.id = void 0;
                scheduler.active = false;
                scheduler.scheduled = false;
                scheduler.flush();
            });
        }
        return this;
    };

    NextScheduledAction.prototype.unsubscribe = function unsubscribe() {
        _ScheduledAction.prototype.unsubscribe.call(this);
        var scheduler = this.scheduler;
        if (scheduler.actions.length === 0) {
            scheduler.active = false;
            scheduler.scheduled = false;
            var id = this.id;
            if (id) {
                this.id = void 0;
                _utilImmediate2['default'].clearImmediate(id);
            }
        }
    };

    return NextScheduledAction;
})(ScheduledAction);

exports.NextScheduledAction = NextScheduledAction;

var FutureScheduledAction = (function (_ScheduledAction2) {
    function FutureScheduledAction(scheduler, state, work, delay) {
        _classCallCheck(this, FutureScheduledAction);

        _ScheduledAction2.call(this, scheduler, state, work);
        this.delay = delay;
    }

    _inherits(FutureScheduledAction, _ScheduledAction2);

    FutureScheduledAction.prototype.schedule = function schedule(state) {
        var self = this;
        var id = this.id;
        var scheduler = this.scheduler;
        if (id != null) {
            this.id = undefined;
            clearTimeout(id);
        }
        this.state = state;
        var scheduleAction = _ScheduledAction2.prototype.schedule;
        this.id = setTimeout(function executeFutureAction() {
            self.id = void 0;
            scheduleAction.call(self, self.state);
        }, this.delay);
        return this;
    };

    FutureScheduledAction.prototype.unsubscribe = function unsubscribe() {
        _ScheduledAction2.prototype.unsubscribe.call(this);
        var id = this.id;
        if (id != null) {
            this.id = void 0;
            clearTimeout(id);
        }
    };

    return FutureScheduledAction;
})(ScheduledAction);

exports.FutureScheduledAction = FutureScheduledAction;