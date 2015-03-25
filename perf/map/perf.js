
require({
	baseUrl: '../../',
	paths: {
	  'benchmark': '../../assets/benchmark/benchmark',
	  'rx2': '../../assets/rxjs2/rx',
	  'perf-helpers': '../perf/perf-helpers'
	}
},
['benchmark', 'src/observable/observable', 'src/subscription/subscription', 'rx2', 'perf-helpers'], 
function(Benchmark, observable, Subscription, Rx, helpers) {
	var Observable = observable.Observable;
	var printLn = helpers.printLn;

	printLn('starting tests');
	var suite = new Benchmark.Suite;


	var noop = function(){};


	var testObservable = new Observable(function(generator) {
		generator.next(42);
		generator.return();

		//HACK: junk subscription
		return new Subscription(noop);
	});

	var projection = function(x) {
		return x + '!!!';
	};

	var rx2TestObservable = Rx.Observable.just(42);

	suite.
		add('Observable.map (lift)', {
			fn: function() {
				testObservable.map(projection).observer({
					next: noop,
					throw: noop,
					return: noop,
				});
			}
		}).
		add('Observable.map2 (observable/observer pair)', {
			fn: function() {
				testObservable.map2(projection).observer({
					next: noop,
					throw: noop,
					return: noop
				});
			}
		}).
		add('RxJS 2 Observable.map', {
			fn: function() {
				rx2TestObservable.map(projection).
					forEach(noop, noop, noop);
			}
		});

	suite.
		on('cycle', function(event) {
		  printLn(String(event.target));
		}).
		on('complete', function() {
		  printLn('Fastest is ' + this.filter('fastest').pluck('name'));
		})
		.run({ async: true });
});