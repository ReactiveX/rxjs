var Observable = require("src/Observable");
var noop = require("src/support/noop");
var staticNever = new Observable({ subscribe: noop });
module.exports = function () {
    return staticNever;
};