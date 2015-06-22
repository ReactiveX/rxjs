define(['exports', 'module', '../ConnectableObservable'], function (exports, module, _ConnectableObservable) {
    'use strict';

    module.exports = multicast;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _ConnectableObservable2 = _interopRequireDefault(_ConnectableObservable);

    function multicast(subject) {
        return new _ConnectableObservable2['default'](this, subject);
    }

    ;
});