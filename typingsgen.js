var fs = require('fs');
var regex = /export interface CoreOperators\<T\> \{([\S|\s]*)\}/;

var content = fs.readFileSync('./src/CoreOperators.ts').toString();
var result = content.match(regex)[1].trim();
var contents = result.split('\n');

var operators = {};
var fileResult = '';

for (var i = 0; i < contents.length; i++) {
  var item = contents[i].trim();
  if (item) {
    var file = item.match(/(.*?)\: operator_proto_(.*?);/);
    if (!file) {
      console.log('item', item, 'file', file);
      continue;
    }
    
    var property = file[1].trim();
    var filename = file[2];
    var fileContent = fs.readFileSync('./src/operators/'+filename+'.ts').toString();
    
    var methods = [];

    var r = new RegExp('export function [_]?'+filename+'(.*)', 'g');
    do {
      var result = r.exec(fileContent);
      if (result) {
        var method = result[1].trim();
        if (method[method.length - 1] === '{' || method[method.length - 1] === '{') {
          method = method.substr(0, method.length - 1).trim();
        }
        console.log(method);
        methods.push(method);
      }
    } while(result);
    
    if (!operators[filename]) {
      operators[filename] = true;
      fileResult += 'interface operator_proto_' + filename + '{ ' + methods.join('; ') + ' }\n';
    }
  }
}

fs.writeFileSync('./typings/operators.d.ts', fileResult);
