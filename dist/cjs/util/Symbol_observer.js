'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

if (!_root2['default'].Symbol) {
    _root2['default'].Symbol = {};
}
if (!_root2['default'].Symbol.observer) {
    if (typeof _root2['default'].Symbol['for'] === 'function') {
        _root2['default'].Symbol.observer = _root2['default'].Symbol['for']('observer');
    } else {
        _root2['default'].Symbol.observer = '@@observer';
    }
}
exports['default'] = _root2['default'].Symbol.observer;
module.exports = exports['default'];