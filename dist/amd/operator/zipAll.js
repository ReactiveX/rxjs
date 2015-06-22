define(['exports', 'module', '../Observable'], function (exports, module, _Observable) {
    'use strict';

    module.exports = zipAll;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _Observable2 = _interopRequireDefault(_Observable);

    function zipAll(project) {
        return this.toArray().flatMap(function (observables) {
            return _Observable2['default'].zip(observables, project);
        });
    }
});