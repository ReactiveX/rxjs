var map = require("src/operators/map");
var concatAll = require("src/operators/concat-all");

module.exports = function (selector, obs) {
    
    if(typeof selector !== "function") {
        obs = selector;
        selector = function() { return obs; };
    }
    
    return concatAll.call(map.call(this, selector));
}