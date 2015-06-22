define(['exports', 'module', '../Observable'], function (exports, module, _Observable) {
    'use strict';

    module.exports = empty;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _Observable2 = _interopRequireDefault(_Observable);

    var EMPTY = new _Observable2['default'](function (observer) {
        observer['return']();
    });

    function empty() {
        return EMPTY;
    }

    ;
});