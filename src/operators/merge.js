var mergeAll = require("src/operators/merge-all");
var fromArray = require("src/observable/from-array");

module.exports = function () {
    var argsIdx = -1;
    var argsLen = arguments.length;
    var observables = [this];
    while(++argsIdx < argsLen) {
        observables[argsIdx + 1] = arguments[argsIdx];
    }
    return mergeAll.call(fromArray(observables));
}