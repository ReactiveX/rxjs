'use strict';

exports.__esModule = true;
exports['default'] = never;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('../Observable');

var _Observable2 = _interopRequireDefault(_Observable);

var NEVER = new _Observable2['default'](function (observer) {});

function never() {
    return NEVER; // NEVER!!!!
}

module.exports = exports['default'];