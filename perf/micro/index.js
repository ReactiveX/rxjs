var Rx = require("rx");
var colors = require("colors");
var Observable = Rx.Observable;
var Benchmark = require("benchmark");
var suite = new Benchmark.Suite;

Observable.from([
        require("./immediate-scheduler/observable/empty"),
        require("./immediate-scheduler/observable/from-array"),
        require("./immediate-scheduler/observable/from-with-array"),
        require("./immediate-scheduler/observable/from-with-string"),
        require("./immediate-scheduler/observable/of"),
        require("./immediate-scheduler/observable/range"),
        require("./immediate-scheduler/observable/throw"),

        require("./immediate-scheduler/operators/combine-latest"),
        require("./immediate-scheduler/operators/concat"),
        require("./immediate-scheduler/operators/concat-all"),
        require("./immediate-scheduler/operators/concat-many"),
        require("./immediate-scheduler/operators/default-if-empty"),
        require("./immediate-scheduler/operators/filter"),
        require("./immediate-scheduler/operators/merge"),
        require("./immediate-scheduler/operators/reduce"),
        require("./immediate-scheduler/operators/repeat"),

        require("./immediate-scheduler/operators/flat-map"),
        require("./immediate-scheduler/operators/flat-map-scalar"),
        require("./immediate-scheduler/operators/flat-map-observable"),
        require("./immediate-scheduler/operators/flat-map-observable-scalar"),

        require("./immediate-scheduler/operators/map"),
        require("./immediate-scheduler/operators/scan"),
        require("./immediate-scheduler/operators/skip"),
        require("./immediate-scheduler/operators/start-with"),
        require("./immediate-scheduler/operators/take"),
        require("./immediate-scheduler/operators/to-array"),
        require("./immediate-scheduler/operators/zip"),

        require("./current-thread-scheduler/observable/empty"),
        require("./current-thread-scheduler/observable/from-array"),
        require("./current-thread-scheduler/observable/from-with-array"),
        require("./current-thread-scheduler/observable/from-with-string"),
        require("./current-thread-scheduler/observable/of"),
        require("./current-thread-scheduler/observable/range"),
        require("./current-thread-scheduler/observable/throw"),

        require("./current-thread-scheduler/operators/combine-latest"),
        require("./current-thread-scheduler/operators/concat"),
        require("./current-thread-scheduler/operators/concat-all"),
        require("./current-thread-scheduler/operators/concat-many"),
        require("./current-thread-scheduler/operators/default-if-empty"),
        require("./current-thread-scheduler/operators/filter"),
        require("./current-thread-scheduler/operators/merge"),
        require("./current-thread-scheduler/operators/reduce"),
        require("./current-thread-scheduler/operators/repeat"),

        require("./current-thread-scheduler/operators/flat-map"),
        require("./current-thread-scheduler/operators/flat-map-scalar"),
        require("./current-thread-scheduler/operators/flat-map-observable"),
        require("./current-thread-scheduler/operators/flat-map-observable-scalar"),

        require("./current-thread-scheduler/operators/map"),
        require("./current-thread-scheduler/operators/scan"),
        require("./current-thread-scheduler/operators/skip"),
        require("./current-thread-scheduler/operators/start-with"),
        require("./current-thread-scheduler/operators/take"),
        require("./current-thread-scheduler/operators/to-array"),
        require("./current-thread-scheduler/operators/zip"),

    ])
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
    .subscribe(console.log.bind(console));
