var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var validateMessage = require('validate-commit-msg');

//simple regex matcher to detect usage of helper function and its type signature
var hotMatch = /\bhot\(/gi;
var hotSignatureMatch = /\bdeclare const hot: typeof/gi;

var coldMatch = /\bcold\(/gi;
var coldSignatureMatch = /\bdeclare const cold: typeof/gi;

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