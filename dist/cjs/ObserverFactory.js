'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Observer = require('./Observer');

var _Observer2 = _interopRequireDefault(_Observer);

var ObserverFactory = (function () {
    function ObserverFactory() {
        _classCallCheck(this, ObserverFactory);
    }

    ObserverFactory.prototype.create = function create(destination) {
        return new _Observer2['default'](destination);
    };

    return ObserverFactory;
})();

exports['default'] = ObserverFactory;
module.exports = exports['default'];