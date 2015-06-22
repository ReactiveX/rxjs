define(['exports', 'module', './NextTickScheduler'], function (exports, module, _NextTickScheduler) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _NextTickScheduler2 = _interopRequireDefault(_NextTickScheduler);

  var nextTick = new _NextTickScheduler2['default']();
  module.exports = nextTick;
});