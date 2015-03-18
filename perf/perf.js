
require({
	baseUrl: '..',
	paths: {
	  'benchmark': '../assets/benchmark/benchmark',
	  'rx2': '../assets/rxjs2/rx'
	}
},
['benchmark', 'src/observable/observable', 'src/subscription', 'rx2'], 
function(Benchmark, observable, Subscription, Rx) {
	var Observable = observable.default;
	console.log('starting tests');
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
			defer: true,
			fn: function(deferred) {
				testObservable.map(projection).observer({
					next: noop,
					error: noop,
					return: function(){
						deferred.resolve();
					}
				});
			}
		}).
		add('Observable.map2 (observable/observer pair)', {
			defer: true,
			fn: function(deferred) {
				testObservable.map2(projection).observer({
					next: noop,
					error: noop,
					return: function() {
						deferred.resolve();
					}
				});
			}
		}).
		add('RxJS 2 Observable.map', {
			defer: true,
			fn: function(deferred) {
				rx2TestObservable.map(projection).
					forEach(noop, noop, function(){
						deferred.resolve();
					});
			}
		});

	suite.
		on('cycle', function(event) {
		  console.log(String(event.target));
		}).
		on('complete', function() {
		  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
		})
		.run();
});