'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _NextTickScheduler = require('./NextTickScheduler');

var _NextTickScheduler2 = _interopRequireDefault(_NextTickScheduler);

var nextTick = new _NextTickScheduler2['default']();
exports['default'] = nextTick;
module.exports = exports['default'];