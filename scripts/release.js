// @ts-check

const { execSync } = require('node:child_process');
const { releaseChangelog, releaseVersion } = require('nx/src/command-line/release');
// There are multiple copies of outdated yargs in the workspace, access a known modern one
const yargs = require('nx/node_modules/yargs');

(async () => {
  try {
    const options = await yargs
      // @ts-expect-error - don't use the default meaning of version in yargs
      .version(false)
      .option('version', {
        description: 'Explicit version specifier to use, if overriding conventional commits',
        type: 'string',
      })
      .option('dryRun', {
        alias: 'd',
        description: 'Whether or not to perform a dry-run of the release process, defaults to true',
        type: 'boolean',
        default: true,
      })
      .option('verbose', {
        description: 'Whether or not to enable verbose logging, defaults to false',
        type: 'boolean',
        default: false,
      })
      .option('gitRemote', {
        description: 'The name of the git remote to push the release to, defaults to origin',
        type: 'string',
      })
      .parseAsync();
    if (!options.dryRun) {
      if (!process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) {
        throw new Error(`GH_TOKEN or GITHUB_TOKEN environment variable must be set in order to run a real release`);
      }
    }

    if (!options.gitRemote) {
      options.gitRemote = getRemoteFor('git@github.com:ReactiveX/rxjs.git');
    }

    console.log();
    console.info(`********* Release Options **********`);
    console.info(`version   : ${options.version ?? 'use conventional commits'}`);
    console.info(`dryRun    : ${options.dryRun} ${options.dryRun ? '😅' : '🚨🚨🚨'}`);
    console.info(`verbose   : ${options.verbose}`);
    console.info(`gitRemote : ${options.gitRemote}`);
    console.log();

    // Prepare the packages for publishing
    execSync('yarn prepare-packages', {
      stdio: 'inherit',
      maxBuffer: 1024 * 1024 * 1024, // 1GB
    });

    const { workspaceVersion, projectsVersionData } = await releaseVersion({
      specifier: options.version,
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    // This will create a release on GitHub, which will act as a trigger for the publish.yml workflow
    await releaseChangelog({
      versionData: projectsVersionData,
      version: workspaceVersion,
      interactive: 'all',
      gitRemote: options.gitRemote,
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    if (!options.dryRun) {
      console.log('Check GitHub: https://github.com/ReactiveX/rxjs/actions/workflows/publish.yml');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

/**
 * Gets the name of the git remote for the given URL, if
 * the remote is not found an error is thrown.
 * @param {string} url
 * @returns The name of the git remote for the given URL
 */
function getRemoteFor(url) {
  const stdout = execSync('git remote -v').toString();
  const lines = stdout.split('\n');
  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length > 1 && parts[1] === url) {
      return parts[0];
    }
  }
  throw new Error(`Could not find remote for "${url}"`);
}
