
require({
	baseUrl: '../../',
	paths: {
	  'benchmark': '../../assets/benchmark/benchmark',
	  'platform': '../../assets/platform/platform',
	  'lodash': '../../assets/lodash',
	  'rx2': '../../assets/rxjs2/rx',
	  'perf-helpers': '../perf/perf-helpers'
	}
},
['benchmark', 'src/observable/observable', 'src/subscription', 'rx2', 'perf-helpers'], 
function(Benchmark, observable, Subscription, Rx, helpers) {
	var Observable = observable.default;
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
		return new Observable(function(generator) {
			var tid = setTimeout(function(){
				generator.next(x + '!!!');
				generator.return();
			});
			return new Subscription(function(){
				clearTimeout(tid);
			});
		});
	};

	var rx2TestObservable = Rx.Observable.just(42);

	suite.
		add('Observable.flatMap (lift)', function(d) {
			testObservable.flatMap(projection).observer({
				next: noop,
				error: noop,
				return: noop
			});
		}).
		add('Observable.flatMap2 (observable/observer pair)', function(d) {
			testObservable.flatMap2(projection).observer({
				next: noop,
				error: noop,
				return: noop
			});
		}).
		add('RxJS 2 Observable.flatMap', function(d) {
			rx2TestObservable.flatMap(function(x) {
				return Observable.create(function(observer) {
					var tid = setTimeout(function(){
						observer.onNext(x + '!!!');
						observer.onCompleted();
					}, 0);

					return function(){
						clearTimeout(tid);
					}
				});
			}).forEach(noop, noop, noop);
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