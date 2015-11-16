var fs = require('fs');
var regex = /export interface .*?Operators<T> \{([\S|\s]*)\}/;

var content = fs.readFileSync('./src/CoreOperators.ts').toString();
var content2 = fs.readFileSync('./src/KitchenSinkOperators.ts').toString();
var contentResult = content.match(regex)[1].trim() + '\n' + content2.match(regex)[1].trim();
var contents = contentResult.split('\n');
var extraSpaceRegex = /  /;

var operators = {};
var fileResult = '/* tslint:disable:class-name */ /* tslint:disable:no-unused-variable */ /* tslint:disable:max-line-length */\n\
import {Observable, ObservableOrPromise, ArrayOrIterator} from \'./Observable\';\n\
import {ConnectableObservable} from \'./observables/ConnectableObservable\';\n\
import {Scheduler} from \'./Scheduler\';\n\
import {Notification} from \'./Notification\';\n\
import {Subject} from \'./Subject\';\n\
import {Observer} from \'./Observer\';\n\
import {GroupedObservable} from \'./operators/groupBy-support\';\n\
import {GroupByObservable} from \'./operators/groupBy\';\n\
import {TimeInterval} from \'./operators/extended/timeInterval\';\n\
import {_Selector, _IndexSelector, _SwitchMapResultSelector, _ObservableMergeMapProjector, _IteratorMergeMapProjector, _Predicate, _PredicateObservable, _Comparer, _Accumulator, _MergeAccumulator} from \'./types\';\n\n\
';

for (var i = 0; i < contents.length; i++) {
  var item = contents[i].trim();
  if (item) {
    var file = item.match(/(.*?)\: operators.operator_proto_(.*?)<T>;/);
    if (!file) {
      console.log('item', item, 'file', file);
      continue;
    }

    var property = file[1].trim();
    var filename = file[2].trim();
	if (fs.existsSync('./src/operators/'+filename+'.ts')) {
      var fileContent = fs.readFileSync('./src/operators/'+filename+'.ts').toString();
	} else {
      var fileContent = fs.readFileSync('./src/operators/extended/'+filename+'.ts').toString();
	}

    var methods = [];

    var r = new RegExp('export function [_]?'+ filename +'([\\s|\\S]*?[\\;\\{])', 'g');
    do {
      var result = r.exec(fileContent);
      if (result) {
        var method = result[1].trim();
        if (methods.length > 0 && method.indexOf('{') > -1) {
          continue;
        }

        method = method.split(/\n/g)
          .filter(function(x) { return !!x; })
          .map(function(x) { return (''+x).trim(); })
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

fs.writeFileSync('./src/operator-typings.ts', fileResult);
