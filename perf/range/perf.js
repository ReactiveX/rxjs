require({
    baseUrl: '../../',
    paths: {
      'benchmark': '../../assets/benchmark/benchmark',
      'platform': '../../assets/platform/platform',
      'lodash': '../../assets/lodash',
      'src-2': '../../src-2',
      'rx2': '../../assets/rxjs2/rx',
      'perf-helpers': '../perf/perf-helpers'
    }
},
['benchmark', 'src-2/rx', 'rx2', 'perf-helpers'], 
function(Benchmark, RxNew, RxOld, helpers) {

    var printLn = helpers.printLn;

    printLn('starting tests');
    
    var noop = function() {};
    var suite = new Benchmark.Suite;

    // add tests
    suite.add('old', function() {
      RxOld.Observable.range(0, 25).subscribe(noop, noop, noop);
    })
    .add('new', function() {
      RxNew.Observable.range(0, 25).subscribe(noop, noop, noop);
    })
    // add listeners
    .on('cycle', function(event) {
      printLn(String(event.target));
    })
    .on('complete', function() {
      printLn('Fastest is ' + this.filter('fastest').pluck('name'));
    })
    // run async
    .run({ 'async': true });
});
