import assert from 'node:assert/strict';
import test from 'node:test';
import { selectAuthorizingPullRequest } from './authorize-release-commit.mjs';

const commit = 'a'.repeat(40);
const repository = 'ReactiveX/rxjs';
const version = '9.0.0-beta.4';
const valid = {
  number: 123,
  merged_at: '2026-08-02T00:00:00Z',
  merge_commit_sha: commit,
  title: `chore(release): ${version}`,
  base: { ref: 'master' },
  head: { ref: 'release/rxjs-9', repo: { full_name: repository } },
};

test('accepts only the exact repository-owned release PR and squash commit', () => {
  assert.equal(selectAuthorizingPullRequest([valid], { commit, repository, version }).number, 123);
  for (const changed of [
    { merge_commit_sha: 'b'.repeat(40) },
    { title: 'chore(release): 9.0.0-beta.5' },
    { base: { ref: '7.x' } },
    { head: { ref: 'release/rxjs-9', repo: { full_name: 'attacker/rxjs' } } },
  ]) {
    assert.throws(() => selectAuthorizingPullRequest([{ ...valid, ...changed }], { commit, repository, version }), /found 0/);
  }
});
