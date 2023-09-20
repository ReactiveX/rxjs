const fs = require('fs');

// Load the packages from the package.json workspaces
const packageJson = JSON.parse(fs.readFileSync('package.json'));
const packages = packageJson.workspaces;

packages
  .filter((path) => path.startsWith('packages'))
  .forEach((packagePath) => {
    fs.copyFileSync('LICENSE.txt', `${packagePath}/LICENSE.txt`);
    fs.copyFileSync('CODE_OF_CONDUCT.md', `${packagePath}/CODE_OF_CONDUCT.md`);
  });
