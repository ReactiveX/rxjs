var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var getSize = require('get-folder-size');
var gzipSize = require('gzip-size');
var validateMessage = require('validate-commit-msg');

//simple regex matcher to detect usage of helper function and its type signature
var hotMatch = /\bhot\(/gi;
var hotSignatureMatch = /\bimport \{.*?hot.*?\} from '.*?\/helpers\/marble-testing'/gi;

var coldMatch = /\bcold\(/gi;
var coldSignatureMatch = /\bimport \{.*?cold.*?\} from '.*?\/helpers\/marble-testing'/gi;

var errorCount = 0;

// Warn when PR size is large
var bigPRThreshold = 600;
if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
  warn(':exclamation: Big PR (' + ++errorCount + ')');
  markdown('> (' + errorCount + ') : Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR will helps faster, easier review.');
}

// Check test exclusion (.only) is included
var modifiedSpecFiles = danger.git.modified_files.filter(function (filePath) {
  return filePath.match(/-spec.(js|jsx|ts|tsx)$/gi);
});

var testFilesIncludeExclusion = modifiedSpecFiles.reduce(function (acc, value) {
  var content = fs.readFileSync(value).toString();
  var invalid = _.includes(content, 'it.only') || _.includes(content, 'describe.only');
  if (invalid) {
    acc.push(path.basename(value));
  }
  return acc;
}, []);

if (testFilesIncludeExclusion.length > 0) {
  fail('an \`only\` was left in tests (' + testFilesIncludeExclusion + ')');
}

// Check test cases missing type signature import for test marble helper functions
var testFilesMissingTypes = modifiedSpecFiles.reduce(function (acc, value) {
  var content = fs.readFileSync(value).toString();

  var hotFnMatchesWithoutTypes = content.match(hotMatch) && !content.match(hotSignatureMatch);
  var coldFnMatchesWithoutTypes = content.match(coldMatch) && !content.match(coldSignatureMatch);

  if (hotFnMatchesWithoutTypes || coldFnMatchesWithoutTypes) {
    acc.push(path.basename(value));
  }

  return acc;
}, []);

if (testFilesMissingTypes.length > 0) {
  fail('missing type definition import in tests (' + testFilesMissingTypes + ') (' + ++errorCount + ')');
  markdown('> (' + errorCount + ') : It seems updated test cases uses test scheduler interface `hot`, `cold` but miss to import type signature for those.');
}

//validate commit message in PR if it conforms conventional change log, notify if it doesn't.
var messageConventionValid = danger.git.commits.reduce(function (acc, value) {
  var valid = validateMessage(value.message);
  return valid && acc;
}, true);

if (!messageConventionValid) {
  warn('commit message does not follows conventional change log (' + ++errorCount + ')');
  markdown('> (' + errorCount + ') : RxJS uses conventional change log to generate changelog automatically. It seems some of commit messages are not following those, please check [contributing guideline](https://github.com/ReactiveX/rxjs/blob/master/CONTRIBUTING.md#commit-message-format) and update commit messages.');
}

// TODO(benlesh): update script to run against proper global files
// The name has changed to `rxjs.umd.js` from `Rx.js`

// function getKB(size) {
//   return (size / 1024).toFixed(1);
// }

// function getFormattedKB(size) {
//   if (size < 0) {
//     return '-' + size.toString();
//   } else if (size > 0) {
//     return '+' + size.toString();
//   }
//   return size.toString();
// }

// var globalFile = 'Rx.js';
// var minFile = 'Rx.min.js';

// function sizeDiffBadge(name, value) {
//   var color = 'lightgrey';
//   if (value > 0) {
//     color = 'red';
//   } else if (value < 0) {
//     color = 'green';
//   }
//   return 'https://img.shields.io/badge/' + name + '-' + getFormattedKB(getKB(value)) + 'KB-' + color + '.svg?style=flat-square';
// }

// //post size of build
// schedule(new Promise(function (res) {
//   getSize('./dist/cjs', function (e, result) {
//     var localGlobalFile = path.resolve('./dist/global', globalFile);
//     var localMinFile = path.resolve('./dist/global', minFile);

//     //get sizes of PR build
//     var global = fs.statSync(localGlobalFile);
//     var global_gzip = gzipSize.sync(fs.readFileSync(localGlobalFile, 'utf8'));
//     var min = fs.statSync(localMinFile);
//     var min_gzip = gzipSize.sync(fs.readFileSync(localMinFile, 'utf8'));

//     //resolve path to release build
//     var releasePath = path.dirname(require.resolve(require.resolve('rxjs')));
//     var bundlePath = path.resolve(releasePath, 'bundles');
//     var bundleGlobalFile = path.resolve(bundlePath, globalFile);
//     var bundleMinFile = path.resolve(bundlePath, minFile);

//     var packagePath = path.resolve(releasePath, 'package.json');
//     var releaseVersion = require(packagePath).version;

//     //get sizes of release build
//     var bundleGlobal = fs.statSync(bundleGlobalFile);
//     var bundle_global_gzip = gzipSize.sync(fs.readFileSync(bundleGlobalFile, 'utf8'));
//     var bundleMin = fs.statSync(bundleMinFile);
//     var bundle_min_gzip = gzipSize.sync(fs.readFileSync(bundleMinFile, 'utf8'));

//     var sizeMessage = '<img src="https://img.shields.io/badge/Size%20Diff%20%28' + releaseVersion + '%29--lightgrey.svg?style=flat-square"/>  ';
//     sizeMessage += '<img src="' + sizeDiffBadge('Global', global.size - bundleGlobal.size) + '"/> ';
//     sizeMessage += '<img src="' + sizeDiffBadge('Global(gzip)', global_gzip - bundle_global_gzip) + '"/> ';
//     sizeMessage += '<img src="' + sizeDiffBadge('Min', min.size - bundleMin.size) + '"/> ';
//     sizeMessage += '<img src="' + sizeDiffBadge('Min (gzip)', min_gzip - bundle_min_gzip) + '"/> ';
//     message(sizeMessage);

//     markdown('> CJS: **' + getKB(result) +
//       '**KB, global: **' + getKB(global.size) +
//       '**KB (gzipped: **' + getKB(global_gzip) +
//       '**KB), min: **' + getKB(min.size) +
//       '**KB (gzipped: **' + getKB(min_gzip) + '**KB)');

//     res();
//   });
// }));
