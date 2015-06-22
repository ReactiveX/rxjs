'use strict';

exports.__esModule = true;
exports['default'] = zip;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('../Observable');

var _Observable2 = _interopRequireDefault(_Observable);

function zip(observables, project) {
    return _Observable2['default'].zip([this].concat(observables), project);
}

module.exports = exports['default'];