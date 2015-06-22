"use strict";

exports.__esModule = true;
exports["default"] = arraySlice;
var isArray = Array.isArray;

function arraySlice(array) {
    var index = arguments[1] === undefined ? 0 : arguments[1];

    if (isArray(array) === false) {
        return array;
    }
    var i = -1;
    var n = Math.max(array.length - index, 0);
    var array2 = new Array(n);
    while (++i < n) {
        array2[i] = array[i + index];
    }
    return array2;
}

;
module.exports = exports["default"];