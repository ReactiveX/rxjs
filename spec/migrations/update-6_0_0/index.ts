import { Rule, SchematicContext, Tree, SchematicsException, chain,  } from '@angular-devkit/schematics';
import { TsLintTask, NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export function rxjsV6MigrationSchematic(_options: any): Rule {
  return chain([
    addDependencies(),
    runTsLint(),
  ]);
}

const rxjsCompatVersion = '^6.0.0-rc.0';
const rxjsTSLintVersion = '0.0.0';

function addDependencies() {
  return (tree: Tree, context: SchematicContext) => {
      const pkgPath = '/package.json';
      const buffer = tree.read(pkgPath);
      if (buffer == null) {
        throw new SchematicsException('Could not read package.json');
      }
      const content = buffer.toString();
      const pkg = JSON.parse(content);

      if (pkg === null || typeof pkg !== 'object' || Array.isArray(pkg)) {
        throw new SchematicsException('Error reading package.json');
      }

      if (!pkg.dependencies) {
        pkg.dependencies = {};
      }
      if (!pkg.devDependencies) {
        pkg.devDependencies = {};
      }

      pkg.dependencies['rxjs-compat'] = rxjsCompatVersion;
      pkg.devDependencies['rxjs-tslint'] = rxjsTSLintVersion;

      tree.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
      context.addTask(new NodePackageInstallTask());

      return tree;
  };
}

function runTsLint() {
  return (tree: Tree, context: SchematicContext) => {
    const workspace = getWorkspace(tree);
    const tsLintRules = {
      rulesDirectory: ['node_modules/rxjs-tslint'],
      rules: {
        'update-rxjs-imports': true,
        'migrate-to-pipeable-operators': true,
        'collapse-rxjs-imports': true
      }
    };
    Object.keys(workspace.projects)
      .filter(prj => workspace.projects[prj].architect.build)
      .map(prj => workspace.projects[prj].architect.build.options.tsConfig)
      .forEach(tsConfigPath => {
        const options = {
          tsConfigPath: tsConfigPath,
          tslintConfig: tsLintRules
        };

        context.addTask(new TslintFixTask(options));
      });

  };
}

export function getWorkspacePath(tree: Tree): string {
  const possibleFiles = [ '/angular.json', '/.angular.json' ];
  const path = possibleFiles.filter(path => tree.exists(path))[0];

  return path;
}

export function getWorkspace(tree: Tree): any {
  const path = getWorkspacePath(tree);
  const configBuffer = tree.read(path);
  if (configBuffer === null) {
    throw new SchematicsException(`Could not find (${path})`);
  }
  const config = configBuffer.toString();

  return JSON.parse(config);
}
