define(['exports', 'module', '../Observable'], function (exports, module, _Observable) {
    'use strict';

    module.exports = merge;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _Observable2 = _interopRequireDefault(_Observable);

    function merge(observables) {
        return _Observable2['default'].fromArray([this].concat(observables)).mergeAll();
    }
});