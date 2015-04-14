var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

var tests = [
    require("./concatmap"),
    require("./filter"),
    require("./from"),
    require("./fromarray"),
    require("./map"),
    require("./mergeall"),
    require("./mergeproto"),
    require("./of"),
    require("./range"),
    require("./scan"),
    require("./toarray")
].reduce(function(suite, test) {
    return test(suite);
}, suite);

// add listeners
tests.on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').pluck('name'));
    })
    // run async
    .run({ 'async': true });
