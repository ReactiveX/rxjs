'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Subscriber = require('./Subscriber');

var _Subscriber2 = _interopRequireDefault(_Subscriber);

var SubscriberFactory = (function () {
    function SubscriberFactory() {
        _classCallCheck(this, SubscriberFactory);
    }

    SubscriberFactory.prototype.create = function create(destination) {
        return new _Subscriber2['default'](destination);
    };

    return SubscriberFactory;
})();

exports['default'] = SubscriberFactory;
module.exports = exports['default'];