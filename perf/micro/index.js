var Rx = require("rx");
var colors = require("colors");
var Observable = Rx.Observable;
var Benchmark = require("benchmark");
var suite = new Benchmark.Suite;
var glob = require('glob');
var path = require('path');

Observable.create(function(observer) {
  ["perf/micro/immediate-scheduler/**/*.js", "perf/micro/current-thread-scheduler/**/*.js"]
  .forEach(function(pattern) { 
    try {
      glob.sync(pattern).forEach(function(file) {
        observer.onNext(file);
      })
    } catch(err) {
      observer.onError(err);
    }
  });
  observer.onCompleted();
})
.map(function(filename) {
  return './' + path.relative(__dirname, filename);
})
.filter(function(filePath) {
  var argv = process.argv;
  if(argv && argv.length > 2) {    
    return argv.slice(2).some(function(val) {
      return path.parse(filePath).name === val;
    });
  }
  return true;
})
.map(require)
.concatMap(function (test) {
    var tests = test(new Benchmark.Suite());
    return Observable.defer(function () {

        var cycles = new Rx.ReplaySubject();
        var complete = new Rx.ReplaySubject();

        tests.on("cycle", function (e) {
            cycles.onNext(String(e.target));
        }).on("complete", function () {
            var fastest = this.filter("fastest");
            var fastestName = String(fastest.pluck("name"));
            var fastestTime = parseFloat(this.filter("fastest").pluck("hz"));
            var slowestTime = parseFloat(this.filter("slowest").pluck("hz"));

            // percent change formula: ((V2 - V1) / |V1|) * 100
            if(fastestName.substr(0, 3) === "new") {
                complete.onNext("\t" + (Math.round((fastestTime - slowestTime) / slowestTime * 10000) / 100) + "% " + "faster".green +" than Rx2\n");
            } else {
                complete.onNext("\t" + (Math.round((slowestTime - fastestTime) / fastestTime * 10000) / 100) + "% " + "slower".red + " than Rx2\n");
            }
        }).run({ "async": true });

        return cycles.merge(complete).take(tests.length + 1);
    });
})
.subscribe(console.log.bind(console), function(err) {
    if (err.stack === undefined) {
      console.log(err);
    } else {
      console.log(err.stack); 
    }
  });