define(['exports', 'module', '../Subject'], function (exports, module, _Subject) {
    'use strict';

    module.exports = publish;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _Subject2 = _interopRequireDefault(_Subject);

    function subjectFactory() {
        return new _Subject2['default']();
    }

    function publish() {
        return this.multicast(subjectFactory);
    }
});