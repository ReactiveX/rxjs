export function auditPackedPackage({ name, files, size }, budgets) {
  const errors = [];
  const paths = files.map((file) => file.path);
  const requiredDocs = {
    rxjs: ['README.md', 'MIGRATION.md', 'CONTRIBUTING.md', 'docs/API.md', 'docs/RELEASE_GATES.md', 'docs/PRERELEASE_APPROVAL.md'],
    '@rxjs/observable-polyfill': ['README.md'],
    '@rxjs/test': ['README.md'],
    '@rxjs/migrate': ['README.md', 'docs/MIGRATION_TOOLING_DESIGN.md', 'docs/MIGRATION_QUALIFICATION.md', 'skill/SKILL.md'],
  }[name];

  if (!requiredDocs) return [`Unexpected release package ${name}.`];
  for (const requiredPath of requiredDocs) {
    if (!paths.includes(requiredPath)) errors.push(`${name} is missing ${requiredPath}.`);
  }
  for (const filePath of paths) {
    if (/^(?:src|test)\//.test(filePath) || /\.spec\.[cm]?[jt]sx?$/.test(filePath)) {
      errors.push(`${name} publishes source/test file ${filePath}.`);
    }
    if (/^dist\/(?:browser|commonjs|webpack)\//.test(filePath)) {
      errors.push(`${name} publishes duplicate dialect ${filePath}.`);
    } else if (/^dist\//.test(filePath) && !filePath.startsWith('dist/esm/')) {
      errors.push(`${name} publishes a non-ESM distribution file ${filePath}.`);
    }
  }

  const budget = budgets.packageTarballBytes?.[name];
  if (typeof budget !== 'number') errors.push(`No tarball budget is recorded for ${name}.`);
  else if (size > budget) errors.push(`${name} tarball is ${size} bytes; budget is ${budget}.`);
  return errors;
}
