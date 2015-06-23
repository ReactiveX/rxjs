'use strict';

exports.__esModule = true;
exports['default'] = multicast;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ConnectableObservable = require('../ConnectableObservable');

var _ConnectableObservable2 = _interopRequireDefault(_ConnectableObservable);

function multicast(subjectFactory) {
    return new _ConnectableObservable2['default'](this, subjectFactory);
}

;
module.exports = exports['default'];