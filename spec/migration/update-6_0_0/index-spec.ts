import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { expect } from 'chai';

const collectionPath = path.join(__dirname, '../../../migrations/collection.json');

describe('Migration Schematic', () => {
  let tree: UnitTestTree;

  beforeEach(() => {
    tree = Tree.empty() as UnitTestTree;
    tree.create('/package.json', `{}`);
  });

  it('adds missing dependencies', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    tree = runner.runSchematic('rxjs-migration-01', {}, tree);

    const pkg = JSON.parse(tree.readContent('/package.json'));
    expect(pkg.dependencies['rxjs-compat']).to.equal('^6.0.0-rc.0');
  });
});
