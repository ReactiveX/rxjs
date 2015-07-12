'use strict';

exports.__esModule = true;
exports['default'] = empty;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('../Observable');

var _Observable2 = _interopRequireDefault(_Observable);

var EMPTY = new _Observable2['default'](function (observer) {
    observer.complete();
});

function empty() {
    return EMPTY;
}

;
module.exports = exports['default'];