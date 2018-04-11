import { Rule, SchematicContext, Tree, SchematicsException, chain,  } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

const rxjsCompatVersion = '^6.0.0-rc.0';

export function rxjsV6MigrationSchematic(_options: any): Rule {
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

      pkg.dependencies['rxjs-compat'] = rxjsCompatVersion;

      tree.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
      context.addTask(new NodePackageInstallTask());

      return tree; // <3
  };
}
