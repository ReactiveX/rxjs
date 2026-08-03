import assert from 'node:assert/strict';
import fc from 'fast-check';
import test from 'node:test';
import { classifyConventionalCommit, selectRelease, validatePullRequestTitle } from './release-policy.mjs';

const commit = (subject, body = '') => ({ body, sha: subject.padEnd(40, '0').slice(0, 40), subject });

test('increments only the beta counter for fixes, features, and breaking changes during beta', () => {
  for (const subject of ['fix(core): repair teardown', 'feat(map): add projection option', 'feat(api)!: remove legacy form']) {
    const result = selectRelease({ currentTag: '9.0.0-beta.7', commits: [commit(subject)] });
    assert.equal(result.channel, 'next');
    assert.equal(result.reason, 'beta counter increment');
    assert.equal(result.status, 'planned');
    assert.equal(result.version, '9.0.0-beta.8');
  }
});

test('selects patch and minor releases by the highest accumulated stable change', () => {
  assert.equal(selectRelease({ currentTag: '9.2.3', commits: [commit('fix(core): correct error')] }).version, '9.2.4');
  const result = selectRelease({
    currentTag: '9.2.3',
    commits: [commit('fix(core): correct error'), commit('feat(test): add helper')],
  });
  assert.equal(result.version, '9.3.0');
  assert.equal(result.channel, 'latest');
});

test('blocks breaking stable changes and permits explicit stable promotion', () => {
  assert.equal(selectRelease({ currentTag: '9.2.3', commits: [commit('feat(api)!: break shape')] }).status, 'blocked');
  assert.match(selectRelease({ currentTag: '9.2.3', commits: [commit('feat(api)!: break shape')] }).reason, /10\.0\.0/);
  const promotion = selectRelease({ currentTag: '9.0.0-beta.9', commits: [commit('docs: clarify example')], mode: 'promote-stable' });
  assert.equal(promotion.channel, 'latest');
  assert.equal(promotion.reason, 'explicit stable promotion');
  assert.equal(promotion.status, 'planned');
  assert.equal(promotion.version, '9.0.0');
});

test('does not release documentation or internal chores', () => {
  assert.equal(
    selectRelease({ currentTag: '9.1.0', commits: [commit('docs: explain release'), commit('chore: format files')] }).status,
    'none'
  );
});

test('uses beta.0 for the first release and validates Conventional Commit titles', () => {
  assert.equal(selectRelease({ currentTag: null, commits: [commit('feat(core): initial beta')] }).version, '9.0.0-beta.0');
  assert.equal(classifyConventionalCommit('fix(core): correct teardown').level, 'fix');
  assert.throws(() => validatePullRequestTitle('Correct teardown'), /supported Conventional Commit/);
});

test('ignores the empty pull-request template breaking-change placeholder', () => {
  assert.equal(
    classifyConventionalCommit('fix(core): correct teardown', '**BREAKING CHANGE:** <!-- add description or remove entirely -->').level,
    'fix'
  );
  assert.equal(
    classifyConventionalCommit('fix(core): correct teardown', 'BREAKING CHANGE: changes cancellation ownership').level,
    'breaking'
  );
  assert.equal(
    classifyConventionalCommit('fix(core): correct teardown', '**BREAKING CHANGE:** changes cancellation ownership').level,
    'breaking'
  );
  assert.equal(
    classifyConventionalCommit('fix(core): correct teardown', '**BREAKING CHANGE:** <!--\nadd description or remove entirely\n-->').level,
    'fix'
  );
  assert.equal(
    classifyConventionalCommit('fix(core): correct teardown', '**BREAKING CHANGE:** <!-- placeholder --> changes cancellation ownership')
      .level,
    'breaking'
  );
});

test('selects beta versions monotonically for arbitrary counters and releasable titles', () => {
  fc.assert(
    fc.property(
      fc.nat({ max: 1_000_000 }),
      fc.constantFrom('fix(core): repair lifecycle', 'feat(core): add operator', 'feat(core)!: change contract'),
      (beta, subject) => {
        const result = selectRelease({ currentTag: `9.0.0-beta.${beta}`, commits: [commit(subject)] });
        assert.equal(result.version, `9.0.0-beta.${beta + 1}`);
        assert.equal(result.channel, 'next');
      }
    ),
    { numRuns: 200 }
  );
});

test('classifies an indented multi-line breaking-change footer as breaking', () => {
  assert.equal(
    classifyConventionalCommit('fix(core): correct teardown', 'BREAKING CHANGE:\n  changes cancellation ownership').level,
    'breaking'
  );
  assert.equal(
    classifyConventionalCommit('fix(core): correct teardown', '**BREAKING CHANGES:**\n\tchanges cancellation ownership').level,
    'breaking'
  );
  assert.equal(
    classifyConventionalCommit(
      'fix(core): correct teardown',
      '**BREAKING CHANGE:** <!-- add description or remove entirely -->\n\nBREAKING CHANGE:\n  changes cancellation ownership'
    ).level,
    'breaking'
  );
});
