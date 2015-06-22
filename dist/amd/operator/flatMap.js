define(['exports', 'module', './map', './mergeAll'], function (exports, module, _map, _mergeAll) {
    'use strict';

    module.exports = flatMap;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _map2 = _interopRequireDefault(_map);

    var _mergeAll2 = _interopRequireDefault(_mergeAll);

    function flatMap(project) {
        var concurrent = arguments[1] === undefined ? Number.POSITIVE_INFINITY : arguments[1];

        return _mergeAll2['default'].call(_map2['default'].call(this, project), concurrent);
    }
});