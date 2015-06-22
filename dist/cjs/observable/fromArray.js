'use strict';

exports.__esModule = true;
exports['default'] = fromArray;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ArrayObservable = require('./ArrayObservable');

var _ArrayObservable2 = _interopRequireDefault(_ArrayObservable);

function fromArray(array) {
    return new _ArrayObservable2['default'](array);
}

module.exports = exports['default'];