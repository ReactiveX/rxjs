define(['exports', 'module', './Scheduler'], function (exports, module, _Scheduler) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Scheduler2 = _interopRequireDefault(_Scheduler);

  var immediate = new _Scheduler2['default']();
  module.exports = immediate;
});