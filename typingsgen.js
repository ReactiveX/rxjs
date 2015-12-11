var fs = require('fs');
var regex = /export interface .*?Operators<T> \{([\S|\s]*)\}/;

var core = fs.readFileSync('./src/CoreOperators.ts').toString();
var kitchenSink = fs.readFileSync('./src/Rx.KitchenSink.ts').toString();
var combinedMethods = core.match(regex)[1].trim() + '\n' + kitchenSink.match(regex)[1].trim();
var contents = combinedMethods.split('\n');

var operators = {};
var fileResult = '';

for (var i = 0; i < contents.length; i++) {
  var item = contents[i].trim();
  if (item) {
    var file = item.match(/(.*?)\: operator.operator_proto_(.*?)<T>;/);
    if (!file) {
      continue;
    }

    var filename = file[2].trim();
    var fileContent;

    if (fs.existsSync('./src/operator/' + filename + '.ts')) {
        fileContent = fs.readFileSync('./src/operator/' + filename + '.ts').toString('utf8');
    } else {
        fileContent = fs.readFileSync('./src/operator/extended/' + filename + '.ts').toString('utf8');
    }
	
	fileContent = computeTypingsFor(fileContent);

    var methods = [];

    var r = new RegExp('export function [_]?' + filename + '([\\s|\\S]*?[\\;\\{])', 'g');

    do {
      var result = r.exec(fileContent);
      if (result) {
        var method = result[1].trim();
        if (methods.length > 0 && method.indexOf('{') > -1) {
          continue;
        }

        method = method.split(/\n/g)
          .filter(function (x) { return !!x; })
          .map(function (x) { return ('' + x).trim(); })
          .join(' ')
          .replace(/ = .*?([\,|\)])/g, '$1');

        if (method[method.length - 1] === ';' || method[method.length - 1] === '{') {
          method = method.substr(0, method.length - 1).trim();
        }

        method = method.replace(/^<T>/, '').replace(/^<T, /, '<');
        methods.push(method);
      }
    } while(result);

    if (!operators[filename]) {
      operators[filename] = true;
      fileResult += 'export interface operator_proto_' + filename + '<T> {\n  ' + methods.join(';\n  ') + ';\n}\n';
    }
  }
}

var typingsContent = fs.readFileSync('./src/operator-typings.ts').toString();
fileResult = '/* ||| MARKER ||| */\n' + fileResult + '/* ||| MARKER ||| */';
typingsContent = typingsContent.replace(/(\/\* \|\|\| MARKER \|\|\| \*\/[\s|\S]*?\/\* \|\|\| MARKER \|\|\| \*\/)/, fileResult);
fs.writeFileSync('./src/operator-typings.ts', typingsContent);


function computeTypingsFor(s) {
	var captureRegex = /\/\*\-\-([\s|\S]*?)-\-\*\//g;
	var computeNumberRegex = /\*compute (\d.*?)?\*/;
	var tokenRegex = /\{.*?\}/g;

	s = s.replace(captureRegex, function(capture) {
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
			var start = 1;
			var end = range[0];
		} else {
			var start = range[0];
			var end = range[1];
		}
		
		capture = capture.replace(computeNumberRegex, '').trim();
		
		var tokenResult;
		var results = [];
		for (var number = start; number <= end; number++) {
			var res = capture.replace(tokenRegex, function(capture, index, str) {
				var items = [];
				capture = capture.substr(1, capture.length - 2);
				for (var i = start; i <= number; i++) {
					var typeName = 'T' + (i === 1 ? '' : i);
					items.push(capture.replace(/\|X\|/g, typeName).replace(/\|v\|/g, 'v' + i));
				}
				
				return items.join(', ');
			});
			results.push(res);
		}
		
		return results.join('\n');
	});
	
	return s;
}


