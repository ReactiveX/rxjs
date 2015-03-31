
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
function(Benchmark, RxNew, Rx, helpers) {
    var Observable = RxNew.Observable;
    var Disposable = RxNew.Disposable;
    var printLn = helpers.printLn;

    printLn('starting tests');
    var suite = new Benchmark.Suite;


    var noop = function(){};


    var testObservable = Observable.return(42);

    var projection = function(x) {
        return new Observable(function(generator) {
            var tid = setTimeout(function() {
                generator.next(x + '!!!');
                generator.return();
            });
            return new Disposable(function(){
                clearTimeout(tid);
            });
        });
    };

    var rx2TestObservable = Rx.Observable.just(42);

    suite.
        add('Observable.flatMap (lift)', function(d) {
            testObservable.flatMap(testObservable).subscribe();
        }).
        add('Observable.flatMap2 (observable/observer pair)', {
            fn: function(d) {
                testObservable.flatMap2(testObservable).subscribe();
            }
        }).
        add('RxJS 2 Observable.flatMap', function(d) {
            rx2TestObservable.flatMap(rx2TestObservable).subscribe();
        })

    suite.
        on('cycle', function(event) {
          printLn(String(event.target));
        }).
        on('complete', function() {
          printLn('Fastest is ' + this.filter('fastest').pluck('name'));
        })
        .run({ async: true });
});