var mergeAll = require("src/operators/merge-all");

module.exports = function (dest) {
    return mergeAll.call(this, 1);
};