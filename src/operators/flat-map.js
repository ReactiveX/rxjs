var map = require("src/operators/map");
var mergeAll = require("src/operators/merge-all");

module.exports = function (selector, obs) {
    
    if(typeof selector !== "function") {
        obs = selector;
        selector = function() { return obs; };
    }
    
    return mergeAll.call(map.call(this, selector));
}