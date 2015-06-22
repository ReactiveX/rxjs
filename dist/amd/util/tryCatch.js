define(['exports', 'module', './errorObject'], function (exports, module, _errorObject) {
    'use strict';

    module.exports = tryCatch;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _errorObj = _interopRequireDefault(_errorObject);

    var tryCatchTarget;
    function tryCatcher() {
        try {
            return tryCatchTarget.apply(this, arguments);
        } catch (e) {
            _errorObj['default'].e = e;
            return _errorObj['default'];
        }
    }

    function tryCatch(fn) {
        tryCatchTarget = fn;
        return tryCatcher;
    }

    ;
});