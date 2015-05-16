'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _observer = require('./observer');

var _observer2 = _interopRequireDefault(_observer);

var MapObserver = (function (_Observer) {
    function MapObserver(projection, generator, subscriptionRef) {
        _classCallCheck(this, MapObserver);

        _get(Object.getPrototypeOf(MapObserver.prototype), 'constructor', this).call(this, generator, subscriptionRef);
        this._projection = projection;
    }

    _inherits(MapObserver, _Observer);

    _createClass(MapObserver, [{
        key: 'next',
        value: function next(value) {
            var newValue;
            try {
                newValue = this._projection(value);
            } catch (err) {
                _get(Object.getPrototypeOf(MapObserver.prototype), 'throw', this).call(this, this);
            }
            return _get(Object.getPrototypeOf(MapObserver.prototype), 'next', this).call(this, newValue);
        }
    }]);

    return MapObserver;
})(_observer2['default']);

exports['default'] = MapObserver;
module.exports = exports['default'];

//# sourceMappingURL=map-observer.js.map