'use strict';

exports.__esModule = true;
exports['default'] = merge;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('../Observable');

var _Observable2 = _interopRequireDefault(_Observable);

function merge(observables) {
    return _Observable2['default'].fromArray([this].concat(observables)).mergeAll();
}

module.exports = exports['default'];