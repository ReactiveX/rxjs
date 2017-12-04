/**
 * Script to publish nightly package on travis CI.
 * This script replaces current version into nightly version before publish script.
 *
 */
import { pushd, exec } from 'shelljs';
import * as path from 'path';

/**
 * Check environment variable allows local dry-run execution, without actual npm publish
 */
const isDebug = () => !!process.env.DEBUG && process.env.DEBUG.indexOf('travis-publish-nightly') > -1;

/**
 * Check running environment is travis cron job against correct branch
 */
const verifyNightlyEnvironment = () => {
  const { stdout } = exec('git rev-parse --abbrev-ref HEAD', { silent: true });
  return isDebug() || (process.env.TRAVIS_EVENT_TYPE === 'cron' && (stdout as string).trim() === 'master');
};

/**
 * Main script execution
 */
(async () => {
  if (!verifyNightlyEnvironment()) {
    throw new Error('Not allowed to execute nightly publish');
  }

  const distPackagePath = path.resolve('./dist/package');

  //Run build, change working directory
  exec('npm run build_all');
  pushd(distPackagePath);

  if (!isDebug()) {
    //https://twitter.com/seldo/status/937792328906846208
    //https://docs.npmjs.com/getting-started/using-tags
    exec('npm publish --tag nightly');
  }
})();