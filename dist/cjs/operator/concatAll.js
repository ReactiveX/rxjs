'use strict';

exports.__esModule = true;
exports['default'] = concatAll;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mergeAll = require('./mergeAll');

var _mergeAll2 = _interopRequireDefault(_mergeAll);

function concatAll() {
    return _mergeAll2['default'].call(this, 1);
}

module.exports = exports['default'];