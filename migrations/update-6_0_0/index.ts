import { Rule } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export function rxjsV6MigrationSchematic(): Rule {
  return (_, context) => {
      context.addTask(new NodePackageInstallTask({ packageName: 'rxjs-compat@6.5.2' }));
  };
}
