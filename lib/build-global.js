var glob = require('glob');
var rx = require('rx');
var execSync = require('child_process').execSync;

function globRx(pattern) {
	return rx.Observable.create(function(observer) {
		glob(pattern, function(error, files) {
			if(error) {
				observer.onError(error);
			}
			observer.onNext(files);
			observer.onCompleted();
		});
	}).flatMap(function(files) {
		return rx.Observable.fromArray(files);
	});
}

var buildFiles = [
	'src/util/**/*.ts',
	'src/operators/**/*.ts',
	'src/observable/**/*.ts',
	'src/Subscription.ts',
	'src/CompositeSubscription.ts',
	'src/SerialSubscription.ts',
	'src/Scheduler.ts',
	'src/Observer.ts',
	'src/OperatorObservable.ts',
	'src/Observable.ts',
	'src/RxNext.ts'
]

rx.Observable.fromArray(buildFiles)
	.map(function(pattern) {
		return globRx(pattern);
	})
	.concatAll()
	.do(console.log.bind(console))
	.toArray()
	.map(function(files) {
		return files.join(' ');
	})
	.map(function(fileList) {
		return 'tsc ' + fileList + ' --out dist/global/RxNext.js --target es5';
	})
	.do(console.log.bind(console))
	.subscribe(execSync, function(err) { console.error(err); });