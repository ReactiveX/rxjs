var Rx = require('rx');
var colors = require('colors');
var Observable = Rx.Observable;
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();
var glob = require('glob');
var path = require('path');
var fs = require('fs');

var oldRxPackage = JSON.parse(require('fs').readFileSync('node_modules/rx/package.json'));
var oldVersion = oldRxPackage.version;
var newRxPackage = JSON.parse(require('fs').readFileSync('package.json'));
var newVersion = newRxPackage.version;

function line() {
  return [].slice.call(arguments)
    .map(function (n) {
      return Array(n + 2).join('-');
    }).join('---');
}

function row() {
  var columnWidths = [].slice.call(arguments);

  return function () {
    var data = [].slice.call(arguments);
    return data.map(function (d, i) {
      var text = String(d);
      var w = columnWidths[i];

      if (w < text.length) {
        text = text.substring(0, w);
      }

      while (text.length < w) {
        text = ' ' + text;
      }

      return text;
    }).join(' | ');
  };
}

function formatNumber(n, fix) {
  var f = Number(fix);
  if (typeof fix !== 'number' || !isFinite(fix)) {
    f = n < 100 ? 2 : 0;
  }
  var num = n.toFixed(Number(f));
  var text = String(num).split('.');
  return text[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') +
    (text[1] ? '.' + text[1] : '');
}

function parseCommandLine() {
  var argument;
  var argv = process.argv;
  if (argv && argv.length > 2) {
    argument = argv.slice(2);
  }
  return argument;
}

console.log();
console.log();
console.log();
console.log('Testing against RxJS v ' + oldVersion);
console.log('for csv output, use:  --csv filename.csv');
console.log();
console.log(row(40, 30, 30, 15, 15)('', 'RxJS ' + oldVersion, 'RxJS ' + newVersion, 'factor', '% improved'));
console.log(line(40, 30, 30, 15, 15));

var testArgument = parseCommandLine();
var output = [];
output.push(['name', 'old ops/sec', 'old error margin', 'new ops/sec', 'new error margin', 'factor', 'percent improved']);

Observable.create(function (observer) {
  ['perf/micro/immediate-scheduler/**/*.js', 'perf/micro/current-thread-scheduler/**/*.js']
    .forEach(function (pattern) {
      try {
        glob.sync(pattern).forEach(function (file) {
          observer.onNext(file);
        });
      } catch (err) {
        observer.onError(err);
      }
    });
  observer.onCompleted();
})
  .map(function (filename) {
    return './' + path.relative(__dirname, filename);
  })
  .filter(function (filePath) {
    if (testArgument !== undefined) {
      if (testArgument.length === 2 && testArgument.indexOf('--csv') !== -1) {
        return true;
      }
      var fileArgs = testArgument.slice();
      var csvIndex = fileArgs.indexOf('--csv');
      if (csvIndex !== -1) {
        fileArgs.splice(csvIndex, 2);
      }
      return fileArgs.some(function (val) {
        if (val.slice(-1) === '*') {
          var match = path.parse(filePath).name.match(val);
          return match !== null && val.indexOf(match[0]) !== -1;
        }
        return path.parse(filePath).name === val;
      });
    }
    return true;
  })
  .map(function (filePath) {
    var info = path.parse(filePath);
    return {
      name: info.name + (info.dir.indexOf('immediate') !== -1 ? ' - immediate' : ''),
      test: require(filePath)
    };
  })
  .concatMap(function (x) {
    var test = x.test;
    var name = x.name;
    var tests = test(new Benchmark.Suite(name));

    return Observable.create(function (observer) {
      tests.on('complete', function () {
        var _old = this[0];
        var _new = this[1];

        observer.onNext({
          old: _old,
          new: _new,
          name: name
        });

        observer.onCompleted();
      }).run({ async: true });
    });
  })
  .do(function (d) {
    var r = d.new.hz / d.old.hz;
    var p = (d.new.hz - d.old.hz) / d.old.hz;
    output.push([d.name, d.old.hz, d.old.stats.rme, d.new.hz, d.new.stats.rme, r, p]);
  })
  .map(function (d) {
    var oldHz = d.old.hz;
    var newHz = d.new.hz;
    var r = newHz / oldHz;
    var p = 100 * ((newHz - oldHz) / oldHz);
    var oldRme = ' (\xb1' + d.old.stats.rme.toFixed(2) + '%)';
    var newRme = ' (\xb1' + d.new.stats.rme.toFixed(2) + '%)';
    return row(40, 30, 30, 15, 15)(d.name, formatNumber(oldHz) + oldRme,
      formatNumber(newHz) + newRme, formatNumber(r) + 'x', formatNumber(p, 1) + '%');
  })
  .do(console.log.bind(console))
  .concat(Observable.defer(function () {
    var csv = testArgument && testArgument.indexOf('--csv');
    // If no command line arguments provided, no need to do anthing after running perf tests.
    if (testArgument === null) {
      return Observable.empty();
    }
    // If command line args were provided, but no tests run, throw an error.
    else if (output.length === 1) {
      return Observable.throw(new Error('could not execute specified test, check parameter : ' + testArgument));
    }
    // If we specified a CSV file, write it.
    else if (csv && csv !== -1) {
      var fileName = testArgument[csv + 1];
      return Observable.create(function (obs) {
        var fileData = output.map(function (o) {
          return o.map(JSON.stringify.bind(JSON)).join(',');
        }).join('\n');
        fs.writeFile(fileName, fileData, { encoding: 'utf8' }, function (err, res) {
          if (err) {
            obs.onError(err);
          } else {
            obs.onNext(res);
            obs.onCompleted();
          }
        });
      });
    }
    // All other cases, just complete.
    return Observable.empty();
  }))
  .subscribe(
    function () {},
    function (err) {
      if (err.stack === undefined) {
        (console.error || console.log)(err);
      } else {
        (console.error || console.log)(err.stack);
      }
    },
    function () {}
  );
