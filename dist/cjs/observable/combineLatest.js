'use strict';

exports.__esModule = true;
exports['default'] = combineLatest;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _utilSymbol_observer = require('../util/Symbol_observer');

var _utilSymbol_observer2 = _interopRequireDefault(_utilSymbol_observer);

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var CombineLatestObservable = (function (_Observable) {
    _inherits(CombineLatestObservable, _Observable);

    function CombineLatestObservable(observables, project) {
        _classCallCheck(this, CombineLatestObservable);

        _Observable.call(this, null);
        this.observables = observables;
        this.project = project;
        this.latestEmissions = new Array(observables.length);
        this.emissionsRemaining = new Array(observables.length);
        for (var i = this.emissionsRemaining.length - 1; i >= 0; i--) {
            this.emissionsRemaining[i] = i;
        }
    }

    CombineLatestObservable.prototype.subscriber = function subscriber(_subscriber) {
        var _this = this;

        this.observables.forEach(function (obs, i) {
            var innerSubscriber = new InnerCombineLatestSubscriber(_subscriber, i, _this.project, obs, _this.latestEmissions, _this.emissionsRemaining);
            _subscriber.add(obs[_utilSymbol_observer2['default']](innerSubscriber));
        });
        return _subscriber;
    };

    return CombineLatestObservable;
})(_Observable3['default']);

var InnerCombineLatestSubscriber = (function (_Subscriber) {
    _inherits(InnerCombineLatestSubscriber, _Subscriber);

    function InnerCombineLatestSubscriber(destination, index, project, observable, latestEmissions, emissionsRemaining) {
        _classCallCheck(this, InnerCombineLatestSubscriber);

        _Subscriber.call(this, destination);
        this.index = index;
        this.project = project;
        this.observable = observable;
        this.latestEmissions = latestEmissions;
        this.emissionsRemaining = emissionsRemaining;
    }

    InnerCombineLatestSubscriber.prototype._next = function _next(value) {
        this.latestEmissions[this.index] = value;
        this._updateEmissionsRemaining();
        if (this.emissionsRemaining.length === 0) {
            this._sendNext(this.latestEmissions);
        }
    };

    InnerCombineLatestSubscriber.prototype._updateEmissionsRemaining = function _updateEmissionsRemaining() {
        var i = this.emissionsRemaining.indexOf(this.index);
        if (i > -1) {
            this.emissionsRemaining.splice(i, 1);
        }
    };

    InnerCombineLatestSubscriber.prototype._sendNext = function _sendNext(args) {
        var value = _utilTryCatch2['default'](this.project).apply(this, args);
        if (value === _utilErrorObject2['default']) {
            this.destination.error(_utilErrorObject2['default'].e);
        } else {
            this.destination.next(value);
        }
    };

    return InnerCombineLatestSubscriber;
})(_Subscriber3['default']);

function combineLatest(observables, project) {
    return new CombineLatestObservable(observables, project);
}

module.exports = exports['default'];