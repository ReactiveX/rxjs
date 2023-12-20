// @ts-check

const { prerelease, valid } = require('semver');
const { releasePublish } = require('nx/src/command-line/release');

(async () => {
  try {
    let npmDistTag;

    // Publishing was triggered via an GitHub release being created (almost certainly via our `yarn release` script)
    if (process.env.GITHUB_EVENT_NAME === 'release') {
      const tag = process.env.GITHUB_REF;
      if (!tag) {
        throw new Error('Error: No tag found on GITHUB_REF');
      }
      if (!valid(tag)) {
        throw new Error(`Error: Git tag ${tag} is not a valid semver version`);
      }
      if (isPrerelease(tag)) {
        npmDistTag = 'next';
      } else {
        npmDistTag = 'latest';
      }
    }

    // Publishing was triggered manually via the GitHub Actions UI
    if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      const branch = process.env.GITHUB_REF;
      if (!branch) {
        throw new Error('Error: No branch found on GITHUB_REF');
      }
      if (branch === 'refs/heads/7.x') {
        npmDistTag = 'latest';
      } else if (branch === 'refs/heads/master') {
        npmDistTag = 'next';
      } else {
        throw new Error(`Error: Branch '${branch}' not recognized for manual publishing, should be either '7.x' or 'master'`);
      }
    }

    if (!npmDistTag) {
      throw new Error(`Error: No npm dist tag could be derived from the current environment`);
    }

    await releasePublish({
      registry: 'https://registry.npmjs.org',
      tag: npmDistTag,
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

function isPrerelease(version) {
  // prerelease returns an array of matching prerelease "components", or null if the version is not a prerelease
  return prerelease(version) !== null;
}
