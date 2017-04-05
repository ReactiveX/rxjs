
var fs = require('fs');
var path = require('path');
var dest = path.resolve(__dirname, '..', process.argv.slice(2).join('').trim(), 'src');

var fpFolder = path.resolve(dest, 'fp');
var pipeFolder = path.resolve(dest, 'pipe');
var opFolder = path.resolve(dest, 'operator');

if (!fs.existsSync(fpFolder)) {
  fs.mkdirSync(fpFolder);
}
if (!fs.existsSync(pipeFolder)) {
  fs.mkdirSync(pipeFolder);
}

var operators = [];
var operatorNameMap = {};

/**
 * This is a simple parser for finding parts of a method
 * We return the bounds of the argument body
 * We also return the argument names so that we
 *    generate a method body with the correct names
 *
 * @param {string} body
 * @returns
 */
function getArgsFromBody(body) {
  var index = 0;
  var typeDefinition = false;
  var genericDefinition = false;
  var argNames = [];
  var name = '';
  var bodyOpen = 0;
  var inComment = false;
  var inBlockComment = false;
  var bodyClosedAt = -1;
  var methodStartAt = -1;
  var bodyOpenAt = -1;
  while (index < body.length) {
    // Track when we are in the argument body
    if (body[index] === '(') {
      if (bodyOpen <= 0) {
        bodyOpenAt = index;
      }
      bodyOpen++;
      index++;
      continue;
    }

    // Track once we leave the argument body
    // We could also be entering a delegate declaration
    if (body[index] === ')') {
      bodyOpen--;
      index++;
      if (bodyOpen <= 0) {
        bodyClosedAt = index;
      }
      continue;
    }

    // When we get to the method start
    // we are done, as we remove all content after the new method body
    if (body[index] === '{') {
      methodStartAt = index;
      break;
    }

    // Only process if we are in the argument body
    // and not in a delegate declaration
    if (bodyOpen <= 0 || bodyOpen > 1) {
      index++;
      continue;
    }

    // Determine if we're in a comment
    if (!inComment && !inBlockComment && body[index] === '/' && (body[index + 1] === '/' || body[index + 1] === '*')) {
      inBlockComment = body[index + 1] === '*';
      inComment = body[index + 1] === '/';
    }

    // Find out if we've exited a block comment
    if (inBlockComment && body[index] === '/' && body[index - 1] === '*') {
      inBlockComment = false;
      index++;
      continue;
    }

    // Find out if we've exited a comment
    if (inComment && body[index] === '\n') {
      inComment = false;
      index++;
      continue;
    }

    if (body[index] === '<' || body[index] === '>') {
      genericDefinition = body[index] === '<';
      index++;
      continue;
    }

    if (!genericDefinition && body[index] === ',') {
      typeDefinition = false;
      index++;
      continue;
    }

    if (!(genericDefinition || typeDefinition) && (body[index] === ':' || body[index] === '=')) {
      typeDefinition = true;
      argNames.push(name.trim());
      name = '';
      index++;
      continue;
    }

    if (!typeDefinition && body[index].match(/\w/)) {
      name += body[index];
    }
    index++;
  }

  return { bodyOpenAt: bodyOpenAt, bodyClosedAt: bodyClosedAt, argNames: argNames, methodStartAt: methodStartAt };
}

fs.readdirSync(opFolder)
  .forEach(function (operator) {
    if (!operator.endsWith('.ts')) { return; }
    // Assume the name is just a .ts file
    var name = operator.split('.')[0];
    operators.push(name);
    operatorNameMap[name] = name;

    var content = fs.readFileSync(path.join(opFolder, operator)).toString();

    content = content.split('\n')
      // Strip imported operators or static methods
      // These are only used in a few cases to share code.
      // In the case of the generated file, we're importing the method that is exported
      .map(function (line) { return line.indexOf('import') > -1 && line.indexOf('Operator') > -1 ? '' : line; })
      .map(function (line) { return line.indexOf('import') > -1 && line.indexOf('Static') > -1 ? '' : line; })
      .map(function (line) { return line.indexOf('tslint:disable') > -1 || line.indexOf('tslint:enable') > -1 ? '' : line; })
      .filter(function (line) { return line !== ''; })
      .join('\n');

    content = content.replace(/this\:/g, 'source:');

    // Try to find the last exported function from the given operator
    var index = content.lastIndexOf('export function ' + name + '<');
    if (index === -1) {
      index = content.lastIndexOf('export function ' + name + 'Proto<');
      operatorNameMap[name] = name + 'Proto';
    }
    if (index === -1) {
      index = content.lastIndexOf('export function _' + name + '<');
      operatorNameMap[name] = '_' + name;
    }

    var body = content.substring(index);
    content = content.substring(0, index);

    var shouldApply = body.indexOf('arguments') > -1;
    // We need to capture the "argument body" of the function
    var result = getArgsFromBody(body);
    var argNames = result.argNames;
    var bodyOpenAt = result.bodyOpenAt;
    var bodyClosedAt = result.bodyClosedAt;
    var methodStartAt = result.methodStartAt;

    body = body.substring(0, methodStartAt);
    if (shouldApply) {
      var b = body.substring(0, bodyOpenAt);
      b += '(...args: any[])';
      b += body.substring(bodyClosedAt);
      body = b;
    }

    content += body;
    content = '// Generated code ahead... there be dragons!\n// tslint:disable\nimport { ' + operatorNameMap[name] + ' as ' + name + 'Base } from \'../operator/' + name + '\';\n' + content;

    var fpContent = content;
    var pipeContent = content;
    pipeContent = pipeContent.replace(/source\: Observable<T>(?:[, |,])?/g, '');
    fpContent = fpContent.replace('multicast<T>(SubjectFactory: () => Subject<T>', 'multicast<T>(source: Observable<T>, SubjectFactory: () => Subject<T>');

    // Handle the case of methods that inspect arguments
    if (shouldApply) {
      fpContent = fpContent.replace('>(...args: any[]):', '>(source: Observable<T>, ...args: any[]):');
      fpContent += '{\n  return ' + name + 'Base.apply(source, args);\n}\n';
      pipeContent += '{\n  return (source: Observable<T>) => ' + name + 'Base.apply(source, args);\n}\n';
    } else {
      fpContent += '{\n  return ' + name + 'Base.call(' + argNames.join(', ') + ');\n}\n';
      pipeContent += '{\n  return (source: Observable<T>) => ' + name + 'Base.call(' + argNames.join(', ') + ');\n}\n';
    }

    // Ensure that we return a partial function
    pipeContent = pipeContent.replace(/\)\: (.+?)(\s?[\{|\;])/g, '): (source: Observable<T>) => $1$2');

    // export function audit.*?\{([\s|\S]+)
    fs.writeFileSync(path.join(fpFolder, operator), fpContent);
    fs.writeFileSync(path.join(pipeFolder, operator), pipeContent);
  });

var rxfp = '';
operators.forEach(function (op) {
  rxfp += 'export { ' + operatorNameMap[op] + ' } from \'./fp/' + op + '\';\n';
});

fs.writeFileSync(path.join(dest, `fp.ts`), rxfp);

var rxpipe = '';
operators.forEach(function (op) {
  rxpipe += 'export { ' + operatorNameMap[op] + ' } from \'./pipe/' + op + '\';\n';
});

fs.writeFileSync(path.join(dest, `pipe.ts`), rxpipe);
