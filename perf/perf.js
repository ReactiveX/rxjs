
require({
	baseUrl: '..',
	paths: {
	  'benchmark': '../assets/benchmark/benchmark'
	}
},
['benchmark', 'src/observable/observable'], 
function(Benchmark, observable) {
	var Observable = observable.default;
	console.log('start');
	var suite = new Benchmark.Suite;

	var testObservable = new Observable(function(generator) {
		[1,2,3,4,5,6,7,8,9,10].map(generator.next.bind(generator));
		generator.return();

		//HACK: junk subscription
		return {
			dispose: function(){}
		};
	});

	var projection = function(x) {
		return x + '!!!';
	};

	var noop = function(){};

	// add tests
	suite.
		add('Observable.map (lift)', {
			defer: true,
			fn: function(deferred) {
				testObservable.map(projection).observer({
					next: noop,
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
					return: function() {
						deferred.resolve();
					}
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

console.log('wat');