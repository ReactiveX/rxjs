
var root = require("src/support/root");
// Shim in iterator support
var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) || '_es6shim_iterator_';
// Bug for mozilla version
if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
    $iterator$ = '@@iterator';
}

module.exports = $iterator$;