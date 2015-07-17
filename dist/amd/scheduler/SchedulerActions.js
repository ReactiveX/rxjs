define(['exports', '../SerialSubscription', '../util/Immediate'], function (exports, _SerialSubscription2, _utilImmediate) {
    'use strict';

    exports.__esModule = true;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _SerialSubscription3 = _interopRequireDefault(_SerialSubscription2);

    var _Immediate = _interopRequireDefault(_utilImmediate);

    var ScheduledAction = (function (_SerialSubscription) {
        function ScheduledAction(scheduler, state, work) {
            _classCallCheck(this, ScheduledAction);

            _SerialSubscription.call(this, null);
            this.scheduler = scheduler;
            this.work = work;
            this.state = state;
        }

        _inherits(ScheduledAction, _SerialSubscription);

        ScheduledAction.prototype.schedule = function schedule() {
            var scheduler = this.scheduler;
            var actions = scheduler.actions;
            actions.push(this);
            scheduler.flush();
            return this;
        };

        ScheduledAction.prototype.execute = function execute() {
            if (this.isUnsubscribed) {
                throw new Error('How did did we execute a canceled ScheduledAction?');
            }
            this.add(this.work(this.state));
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

            _ScheduledAction.apply(this, arguments);
        }

        _inherits(NextScheduledAction, _ScheduledAction);

        NextScheduledAction.prototype.schedule = function schedule() {
            var self = this;
            var scheduler = this.scheduler;
            scheduler.actions.push(this);
            if (!scheduler.scheduled) {
                scheduler.active = true;
                scheduler.scheduled = true;
                this.id = _Immediate['default'].setImmediate(function () {
                    self.id = void 0;
                    scheduler.active = false;
                    scheduler.scheduled = false;
                    scheduler.flush();
                });
            }
            return this;
        };

        NextScheduledAction.prototype.unsubscribe = function unsubscribe() {
            var scheduler = this.scheduler;
            if (scheduler.actions.length === 0) {
                scheduler.active = false;
                scheduler.scheduled = false;
                var id = this.id;
                if (id) {
                    this.id = void 0;
                    _Immediate['default'].clearImmediate(id);
                }
            }
            _ScheduledAction.prototype.unsubscribe.call(this);
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

        FutureScheduledAction.prototype.schedule = function schedule() {
            var self = this;
            var id = this.id;
            var scheduler = this.scheduler;
            if (id != null) {
                this.id = undefined;
                clearTimeout(id);
            }
            var scheduleAction = _ScheduledAction2.prototype.schedule;
            this.id = setTimeout(function executeFutureAction() {
                self.id = void 0;
                scheduleAction.call(self, self.state);
            }, this.delay);
            return this;
        };

        FutureScheduledAction.prototype.unsubscribe = function unsubscribe() {
            var id = this.id;
            if (id != null) {
                this.id = void 0;
                clearTimeout(id);
            }
            _ScheduledAction2.prototype.unsubscribe.call(this);
        };

        return FutureScheduledAction;
    })(ScheduledAction);

    exports.FutureScheduledAction = FutureScheduledAction;
});