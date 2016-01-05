var jasmineCore = require('jasmine-core');

// jasmine-ajax need this
global.getJasmineRequireObj = function () {
  return jasmineCore;
};

// XMLHttpRequest in node
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

var w = global.window;
global.window = global;
require.call(global, 'jasmine-ajax');
global.window = w;
