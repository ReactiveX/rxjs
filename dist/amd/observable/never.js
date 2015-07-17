define(['exports', 'module', '../Observable'], function (exports, module, _Observable) {
    'use strict';

    module.exports = never;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _Observable2 = _interopRequireDefault(_Observable);

    var NEVER = new _Observable2['default'](function (observer) {});

    function never() {
        return NEVER; // NEVER!!!!
    }
});