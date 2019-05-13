import { getSystemPath, normalize, virtualFs } from '@angular-devkit/core';
import { TempScopedNodeJsSyncHost } from '@angular-devkit/core/node/testing';
import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { expect } from 'chai';

const collectionPath = path.join(__dirname, '../../../migrations/collection.json');

describe('Migration Schematic', () => {
  let tree: UnitTestTree;
  let host: TempScopedNodeJsSyncHost;

  beforeEach((done) => {
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));
    process.chdir(getSystemPath(host.root));
    host.write(normalize('/package.json'), virtualFs.stringToFileBuffer('{}'))
      .toPromise()
      .then(() => done(), err => done(err));
  });

  it('adds missing dependencies', (done) => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    tree = runner.runSchematic('rxjs-migration-01', {}, tree);

    runner.engine.executePostTasks().toPromise()
      .then(() => host.read(normalize('/package.json')).toPromise())
      .then(data => {
        const pkg = JSON.parse(Buffer.from(data).toString());
        expect(pkg.dependencies['rxjs-compat']).to.equal('^6.5.2');
        done();
      }).catch(err => done(err));
  });
});
