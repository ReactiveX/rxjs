//inject mocha globally to allow custom interface refer without direct import - bypass bundle issue
global.mocha = require('mocha');
global.Suite = global.mocha.Suite;
global.Test = global.mocha.Test;