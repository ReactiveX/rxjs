// Karma configuration
// Generated on Tue Dec 08 2015 23:01:01 GMT-0800 (Pacific Standard Time)

module.exports = function (config) {
  // Check out https://saucelabs.com/platforms for expanding browser coverage
  var customLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: '47'
    },
    sl_chrome_beta: {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: 'beta'
    },
    sl_chrome_dev: {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: 'dev'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '42'
    },
    sl_firefox_beta: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: 'beta'
    },
    sl_firefox_dev: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: 'dev'
    },
    sl_safari9: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11',
      version: '9.0'
    },
    sl_ios9: {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.10',
      version: '9.1'
    },
    sl_android5: {
      base: 'SauceLabs',
      browserName: 'android',
      platform: 'Linux',
      version: '5.1'
    }
  };

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'spec/helpers/marble-testing.js',
      'spec/helpers/test-helper.js',
      'spec/**/*-spec.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'spec/**/*.js': ['browserify']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots','saucelabs'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    customLaunchers: customLaunchers,
    browsers: process.env.TRAVIS ? Object.keys(customLaunchers) : ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: 1,

    sauceLabs: {
      testName: 'RxJS 5 browser test',
      options: {
        'command-timeout': 600,
        'idle-timeout': 600,
        'max-duration': 5400
      }
    }
  });
};