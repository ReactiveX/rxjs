// @ts-check

const { copyFileSync } = require('fs');
const { createProjectGraphAsync, joinPathFragments, workspaceRoot } = require('@nx/devkit');

const getWorkspacePath = (...pathFragments) => joinPathFragments(workspaceRoot, ...pathFragments);

(async () => {
  const projectGraph = await createProjectGraphAsync();

  for (const projectConfig of Object.values(projectGraph.nodes)) {
    const projectRoot = projectConfig.data.root;
    if (!projectRoot.startsWith('packages')) {
      continue;
    }
    copyFileSync(getWorkspacePath('LICENSE.txt'), getWorkspacePath(projectRoot, `LICENSE.txt`));
    copyFileSync(getWorkspacePath('CODE_OF_CONDUCT.md'), getWorkspacePath(projectRoot, `CODE_OF_CONDUCT.md`));
  }

  process.exit(0);
})();
