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
        default: 'origin',
      })
      .parseAsync();

    if (!options.dryRun) {
      if (!process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) {
        throw new Error(`GH_TOKEN or GITHUB_TOKEN environment variable must be set in order to run a real release`);
      }
      if (options.gitRemote !== 'upstream') {
        throw new Error(
          `Expected --gitRemote to be set to "upstream" when running a real release. Add --gitRemote=upstream to the release command.`
        );
      }
    }

    // Prepare the packages for publishing
    execSync('yarn prepare-packages', {
      stdio: 'inherit',
      maxBuffer: 1024 * 1000000,
    });

    const { workspaceVersion, projectsVersionData } = await releaseVersion({
      specifier: options.version,
      // stage package.json updates to be committed later by the changelog command
      stageChanges: true,
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    // This will create a release on GitHub, which will act as a trigger for the publish.yml workflow
    await releaseChangelog({
      versionData: projectsVersionData,
      version: workspaceVersion,
      interactive: 'workspace',
      gitRemote: options.gitRemote,
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
