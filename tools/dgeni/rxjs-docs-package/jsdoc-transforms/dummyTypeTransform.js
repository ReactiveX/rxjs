module.exports = function dummyTypeTransform(doc, tag, value) {
  var TYPE_EXPRESSION_START = /^\s*\{[^@]/;
  var start, position, count, length, expression;

  var match = TYPE_EXPRESSION_START.exec(value);
  if (match) {
    length = value.length;
    // the start is the beginning of the `{`
    start = match[0].length - 2;
    // advance to the first character in the type expression
    position = match[0].length - 1;
    count = 1;

    while (position < length) {
      switch (value[position]) {
      case '\\':
        // backslash is an escape character, so skip the next character
        position++;
        break;
      case '{':
        count++;
        break;
      case '}':
        count--;
        break;
      default:
          // do nothing
      }

      if (count === 0) {
        break;
      }
      position++;
    }

    tag.typeExpression = value.slice(start + 1, position).trim().replace('\\}', '}').replace('\\{', '{');
    tag.description = (value.substring(0, start) + value.substring(position + 1)).trim();
    return tag.description;
  } else {
    return value;
  }
};
