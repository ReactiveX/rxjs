// @ts-check

const { prerelease, valid } = require('semver');
const { releasePublish } = require('nx/src/command-line/release');

/**
 * Maps git branch names to npm dist tags. If master is an alpha/beta release,
 * then it should be mapped to 'next'. Similarly there should be one record for
 * the 'latest' tag.
 */
const DIST_TAGS = {
  'refs/heads/7.x': 'latest',
  'refs/heads/master': 'next',
};

if (!Object.values(DIST_TAGS).includes('latest')) {
  console.error(`Invalid DIST_TAGS:\n${JSON.stringify(DIST_TAGS, null, 2)}`);
  throw new Error("DIST_TAGS must contain a mapping for 'latest'");
}

(async () => {
  try {
    let npmDistTag;

    // Publishing was triggered via an GitHub release being created (almost certainly via our `yarn release` script)
    if (process.env.GITHUB_EVENT_NAME === 'release') {
      let tag = process.env.GITHUB_REF;
      if (!tag) {
        throw new Error('No tag found in environment variable GITHUB_REF');
      }
      if (!valid(tag) && /^refs\/tags\//.test(tag)) {
        // It might be a full ref tag name instead of just a version, so try to get the version from the tag
        tag = tag.split('/').pop();
      }
      if (!valid(tag)) {
        throw new Error(`Git tag '${tag}' pulled from environment variable GITHUB_REF is not a valid semver version`);
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
        throw new Error('No branch found in environment variable GITHUB_REF');
      }

      npmDistTag = DIST_TAGS[branch];

      if (!npmDistTag) {
        throw new Error(
          `Branch '${branch}' found in environment variable GITHUB_REF is not recognized for manual publishing, should be either '7.x' or 'master'`
        );
      }
    }

    if (!npmDistTag) {
      throw new Error('No npm dist tag could be derived from the current environment');
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
