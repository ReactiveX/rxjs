define(['exports', 'module', './ArrayObservable'], function (exports, module, _ArrayObservable) {
    'use strict';

    module.exports = fromArray;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _ArrayObservable2 = _interopRequireDefault(_ArrayObservable);

    function fromArray(array) {
        return new _ArrayObservable2['default'](array);
    }
});