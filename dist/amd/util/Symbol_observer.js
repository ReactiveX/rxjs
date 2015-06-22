define(['exports', 'module', './root'], function (exports, module, _root) {
    'use strict';

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _root2 = _interopRequireDefault(_root);

    if (!_root2['default'].Symbol) {
        _root2['default'].Symbol = {};
    }
    if (!_root2['default'].Symbol.observer) {
        if (typeof _root2['default'].Symbol['for'] === 'function') {
            _root2['default'].Symbol.observer = _root2['default'].Symbol['for']('observer');
        }
        _root2['default'].Symbol.observer = '@@observer';
    }
    module.exports = _root2['default'].Symbol.observer;
});