define(["exports", "module"], function (exports, module) {
    "use strict";

    module.exports = arraySlice;
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
});