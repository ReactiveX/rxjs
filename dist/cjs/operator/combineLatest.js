'use strict';

exports.__esModule = true;
exports['default'] = combineLatest;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('../Observable');

var _Observable2 = _interopRequireDefault(_Observable);

function combineLatest(observables, project) {
    return _Observable2['default'].combineLatest([this].concat(observables), project);
}

module.exports = exports['default'];