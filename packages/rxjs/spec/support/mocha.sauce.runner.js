var _ = require('lodash');
var mochaSauce = require('mocha-in-sauce');

var customLaunchers = {
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: '46'
  },
  sl_chrome_beta: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'beta'
  },
  /*
  sl_chrome_dev: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'dev'
  },*/
  sl_firefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: '44'
  },
  /*sl_firefox_beta: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'beta'
  },
  sl_firefox_dev: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'dev'
  },*/
  sl_safari7: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.9',
    version: '7'
  },
  sl_safari8: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.10',
    version: '8'
  },
  sl_safari9: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '9.0'
  },
  sl_ios8: {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.11',
    version: '8.4'
  },
  sl_ios9: {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.11',
    version: '9.1'
  },
  sl_ie9: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 2008',
    version: '9'
  },
  sl_ie10: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 2012',
    version: '10'
  },
  sl_ie11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11'
  },
  sl_edge: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    platform: 'Windows 10',
    version: '14.14393'
  },
  sl_edge_13: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    platform: 'Windows 10',
    version: '13.10586'
  },
  sl_android_4_1: {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.1'
  },
  sl_android_4_2: {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.2'
  },
  sl_android_4_3: {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.3'
  },
  sl_android_4_4: {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.4'
  },
  sl_android5: {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '5.1'
  }
};

var sauce = new mochaSauce({
  name: 'RxJS 5 browser test',
  build: process.env.TRAVIS_BUILD_NUMBER,
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY,
  host: 'localhost',
  port: 4445,
  runSauceConnect: true, // run sauceConnect automatically

  url: 'http://localhost:9876/spec/support/mocha-browser-runner.html'
});

sauce.record(true, true);
sauce.concurrency(1);

_.each(customLaunchers, function (browser) {
  sauce.browser(browser);
});

sauce.on('start', function (browser) {
  console.log('  started %s %s %s ...', browser.browserName, browser.version, browser.platform || '');
});

sauce.on('end', function (browser, res) {
  console.log('  completed %s %s %s ... : %d failures', browser.browserName, browser.version, browser.platform || '', res.failures);
});

sauce.start(function (err, res) {
  console.log('-------------- done --------------');
});