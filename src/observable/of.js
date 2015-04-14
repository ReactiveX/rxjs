var fromArray = require("src/observable/from-array");
var Scheduler = require("src/Scheduler");

module.exports = function(scheduler) {
    var args, len = arguments.length;
    
    if((scheduler = arguments[len - 1]) instanceof Scheduler) {
        len -= 1;
        args = new Array(len);
        for (var i = 0; i < len; i++) {
            args[i] = arguments[i];
        }
        return fromArray(args, scheduler);
    }
    
    args = new Array(len);
    for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
    }
    return fromArray(args);
}