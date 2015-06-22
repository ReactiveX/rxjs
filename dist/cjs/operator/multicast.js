'use strict';

exports.__esModule = true;
exports['default'] = multicast;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ConnectableObservable = require('../ConnectableObservable');

var _ConnectableObservable2 = _interopRequireDefault(_ConnectableObservable);

function multicast(subject) {
    return new _ConnectableObservable2['default'](this, subject);
}

;
module.exports = exports['default'];