var fs = require('fs');
var regex = /export (interface|class) .*?Operators<T>\s*\{([\S|\s]*)\}/;

var core = fs.readFileSync('./src/Observable.ts').toString();
var kitchenSink = fs.readFileSync('./src/Rx.KitchenSink.ts').toString();
var combinedMethods = core.match(regex)[2].trim() + '\n' + kitchenSink.match(regex)[2].trim();
var contents = combinedMethods.split('\n');

var hasOperators = {};
var observables = {};
var operators = {};
var fileResult = '';

for (var i = 0; i < contents.length; i++) {
  var item = contents[i].trim();
  if (item) {
    var file = item.match(/(.*?)\: (operator|observable)\.(proto|static|create)\.(.*?)(<T>)?;/);
    if (!file) {
      continue;
    }

    var _observable = file[2] === "observable";
    var _static = file[3] === "static" || _observable;
    var name = file[4].trim();
    var filename = file[4].trim() + (!_observable && _static ? '-static' : '');
    var fileContent;

    if (_observable) {
      fileContent = fs.readFileSync('./src/observable/' + filename + '.ts').toString('utf8');
    } else {
      if (fs.existsSync('./src/operator/' + filename + '.ts')) {
        fileContent = fs.readFileSync('./src/operator/' + filename + '.ts').toString('utf8');
      }
    }

    fileContent = computeTypingsFor(fileContent);

    var methods = [];

    var r;
    if (_observable) {
      r = new RegExp('static [_]?' + file[3] + '([\\s|\\S]*?[\\;\\{])', 'g');
    } else {
      r = new RegExp('export function [_]?' + name + '([\\s|\\S]*?[\\;\\{])', 'g');
    }

    do {
      var result = r.exec(fileContent);
      if (result) {
        var method = result[1].trim();
        if (methods.length > 0 && method.indexOf('{') > -1) {
          continue;
        }

        method = method.split(/\n/g)
          .filter(function(x) {
            return !!x;
          })
          .map(function(x) {
            return ('' + x).trim();
          })
          .join(' ')
          .replace(/([\w|\d]*?)\: (\w*) = [\w|\d|\.|\-]*/g, '$1?: $2');

        if (method[method.length - 1] === ';' || method[method.length - 1] === '{') {
          method = method.replace(/(,\s){2}/g, ', ').substr(0, method.length - 1).trim();
        }

        if (!_static) {
          method = method.replace(/^<T>/, '').replace(/^<T, /, '<');
        }
        method = method.replace(/^<>/, '');
        if (method.indexOf(';') === -1) {
          method += ';';
        }
        methods.push(method);
      }
    } while (result);

    if (!hasOperators[filename]) {
      hasOperators[filename] = true;
      if (_observable) {
        observables[file[2]] = {
          name: name,
          type: file[3],
          methods: methods
        };
      } else {
        operators[file[2]] = {
          name: name,
          type: file[3],
          methods: methods
        };
      }
    }
  }
}

fileResult += 'export module observable {\n';
for (var i in observables) {
  var value = observables[i];
  fileResult += '  export module ' + value.type + ' {\n';
  fileResult += '    export interface ' + value.name + ' {\n';
  fileResult += '      ' + value.methods.join('\n      ') + '\n';
  fileResult += '    }\n';
  fileResult += '  }\n';
}
fileResult += '}\n';

fileResult += 'export module operator {\n';
for (var i in operators) {
  var value = operators[i];
  fileResult += '  export module ' + value.type + ' {\n';
  fileResult += '    export interface ' + value.name + ' {\n';
  fileResult += '      ' + value.methods.join('\n      ') + '\n';
  fileResult += '    }\n';
  fileResult += '  }\n';
}
fileResult += '}\n';

var typingsContent = fs.readFileSync('./src/typings-generated.ts').toString();
fileResult = '/* ||| MARKER ||| */\n' + fileResult + '/* ||| MARKER ||| */';
typingsContent = typingsContent.replace(/(\/\* \|\|\| MARKER \|\|\| \*\/[\s|\S]*?\/\* \|\|\| MARKER \|\|\| \*\/)/, fileResult);
fs.writeFileSync('./src/typings-generated.ts', typingsContent);


function computeTypingsFor(s) {
  var captureRegex = /\/\*\-\-([\s|\S]*?)-\-\*\//g;
  var computeNumberRegex = /\*compute (\d.*?)?(x\d.*?)?\*/;
  var tokenRegex = /\{.*?\}/g;

  s = s.replace(captureRegex, function(capture) {
    var start, end;
    capture = capture.trim();
    capture = capture.substr(3, capture.length - 3 * 2);
    var compute = computeNumberRegex.exec(capture);
    if (compute) {
      compute = compute[1] || '6';
    } else {
      compute = '6';
    }
    var range = compute.split('-');
    if (range.length === 1) {
      start = 1;
      end = +range[0];
    } else {
      start = +range[0];
      end = +range[1];
    }

    capture = capture.replace(computeNumberRegex, '').trim();

    var results = [];
    for (var number = start; number <= end; number++) {
      var res = capture.replace(tokenRegex, function(capture, index, str) {
        var items = [];
        capture = capture.substr(1, capture.length - 2);
        var union = capture.indexOf('$X$') > -1;

        for (var x = start; x <= number; x++) {
            if (x === 0) {
              continue;
            }
            var xTypeName = 'T' + (x === 1 ? '' : x);
            var r = capture
              .replace(/\|X\|/g, xTypeName)
              .replace(/\$X\$/g, xTypeName)
              .replace(/\|x\|/g, 'x' + x);

            items.push(r);
          }

        return items.join(union ? ' | ' : ', ');
      });
      results.push(res);
    }

    return results.join('\n');
  });

  return s;
}