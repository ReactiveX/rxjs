'use strict';

exports.__esModule = true;
exports['default'] = zipAll;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('../Observable');

var _Observable2 = _interopRequireDefault(_Observable);

function zipAll(project) {
    return this.toArray().flatMap(function (observables) {
        return _Observable2['default'].zip(observables, project);
    });
}

module.exports = exports['default'];