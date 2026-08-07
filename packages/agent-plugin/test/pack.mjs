import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const temporary = await mkdtemp(resolve(tmpdir(), 'rxjs-agent-plugin-pack-'));
try {
  const packed = spawnSync('npm', ['pack', '--json', '--pack-destination', temporary], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: resolve(temporary, 'npm-cache') },
  });
  assert.equal(packed.status, 0, packed.stderr);
  const report = JSON.parse(packed.stdout)[0];
  const names = report.files.map(({ path }) => path).sort();
  for (const required of ['plugin.json', 'mcp.json', 'dist/mcp-server.cjs', 'dist/knowledge-digests.json']) {
    assert(names.includes(required), `packed artifact is missing ${required}`);
  }
  assert(names.filter((name) => /(^|\/)SKILL\.md$/.test(name)).length === 11, 'packed artifact must contain all eleven skills');
  assert(
    !names.some((name) => name.startsWith('src/') || name.startsWith('scripts/') || name.startsWith('test/')),
    'source and tests must not ship'
  );
  assert(
    !names.some((name) => name.startsWith('claude-adapter/') || name.startsWith('.claude-plugin/')),
    'client-specific adapter must not ship'
  );
  const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  assert.deepEqual(manifest.dependencies ?? {}, {}, 'the prebuilt MCP must have no undeclared runtime installation');

  const archive = resolve(temporary, basename(report.filename));
  const untar = spawnSync('tar', ['-xzf', archive, '-C', temporary], { encoding: 'utf8' });
  assert.equal(untar.status, 0, untar.stderr);
  const packageRoot = resolve(temporary, 'package');
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve(packageRoot, 'dist/mcp-server.cjs')],
    cwd: packageRoot,
    stderr: 'pipe',
  });
  const client = new Client({ name: 'rxjs-packed-artifact-test', version: '1.0.0' });
  await client.connect(transport);
  const tools = await client.listTools();
  assert.deepEqual(tools.tools.map(({ name }) => name).sort(), [
    'analyze_migration',
    'migration_capabilities',
    'preview_migration',
    'validate_migration_contract',
  ]);
  const capabilities = await client.callTool({ name: 'migration_capabilities', arguments: {} });
  assert.equal(capabilities.isError, undefined);
  const preview = await client.callTool({
    name: 'preview_migration',
    arguments: {
      files: [
        { path: 'src/example.ts', source: "import { map } from 'rxjs/operators';\nconst result = source.pipe(map(value => value));\n" },
      ],
    },
  });
  assert.equal(preview.isError, undefined);
  const refusal = await client.callTool({
    name: 'preview_migration',
    arguments: { files: [{ path: '../escape.ts', source: '' }] },
  });
  assert.equal(refusal.isError, true);
  await client.close();
  assert((await readdir(packageRoot)).includes('dist'));
  console.log(`Packed artifact contains ${names.length} reviewed files and its MCP lifecycle passed.`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
