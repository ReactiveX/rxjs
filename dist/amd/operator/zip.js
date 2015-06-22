define(['exports', 'module', '../Observable'], function (exports, module, _Observable) {
    'use strict';

    module.exports = zip;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _Observable2 = _interopRequireDefault(_Observable);

    function zip(observables, project) {
        return _Observable2['default'].zip([this].concat(observables), project);
    }
});