'use strict';

exports.__esModule = true;
exports['default'] = publish;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Subject = require('../Subject');

var _Subject2 = _interopRequireDefault(_Subject);

function subjectFactory() {
    return new _Subject2['default']();
}

function publish() {
    return this.multicast(subjectFactory);
}

module.exports = exports['default'];