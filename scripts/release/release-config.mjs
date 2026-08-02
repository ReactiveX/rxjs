export const releasePackages = [
  { name: '@rxjs/observable-polyfill', directory: 'packages/observable-polyfill' },
  { name: '@rxjs/test', directory: 'packages/test' },
  { name: '@rxjs/migrate', directory: 'packages/migrate' },
  { name: 'rxjs', directory: 'packages/rxjs' },
];

export const releaseBranch = 'master';
export const releasePullRequestBranch = 'release/rxjs-9';
export const releaseOperatorLogin = 'benlesh';
export const firstReleaseVersion = '9.0.0-beta.0';
export const stagedPackagesVariable = 'NPM_STAGED_PACKAGES_URL';
export const npmWebOrigin = 'https://www.npmjs.com';
export const releaseToolchain = Object.freeze({
  runner: 'ubuntu-24.04',
  node: '24.12.0',
  pnpm: '10.34.5',
  npm: '11.18.0',
  npmIntegrity: 'sha512-T67M4L5wNm0cZ7EBLErcEkY1SmzEW/WJ+SADBzsFUY1UdAPfFHXFQtZ6SEXiK0+vzXysCvAsepbMaBTwnrAD+w==',
});

export const versionedFiles = [
  'packages/observable-polyfill/src/index.ts',
  'packages/observable-polyfill/test/import/esm.mjs',
  'packages/observable-polyfill/test/import/commonjs.cjs',
  'packages/rxjs/test/import/fixture-scenario.mjs',
  'packages/migrate/src/version.ts',
];

export const releaseBotAllowedFiles = new Set([
  'CHANGELOG.md',
  'pnpm-lock.yaml',
  '.agents/skills/rxjs-next-migration/.rxjs-migrate-skill.json',
  ...releasePackages.map(({ directory }) => `${directory}/package.json`),
  ...versionedFiles,
]);

export function channelForVersion(version) {
  return version.includes('-') ? 'next' : 'latest';
}

export function assertNpmWebUrl(value, label = stagedPackagesVariable) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute URL.`);
  }
  if (url.origin !== npmWebOrigin || url.username || url.password) {
    throw new Error(`${label} must use the exact ${npmWebOrigin}/ origin without credentials.`);
  }
  return url.href;
}
