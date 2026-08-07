import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const MAX_FILES = 25;
const MAX_FILE_BYTES = 512 * 1024;
const MAX_TOTAL_BYTES = 2 * 1024 * 1024;
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
  assert(names.filter((name) => /(^|\/)SKILL\.md$/.test(name)).length === 13, 'packed artifact must contain all thirteen skills');
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

  const discovery = await client.listTools();
  const tools = new Map(discovery.tools.map((tool) => [tool.name, tool]));
  assert.deepEqual([...tools.keys()].sort(), [
    'analyze_migration',
    'migration_capabilities',
    'preview_migration',
    'validate_migration_contract',
  ]);
  for (const [name, tool] of tools) {
    assert(tool.description, `${name} must have a description`);
    assert.deepEqual(tool.annotations, {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    });
    assert.equal(tool.inputSchema.type, 'object');
    assert.equal(tool.inputSchema.additionalProperties, false, `${name} must reject undeclared input fields`);
  }
  for (const name of ['analyze_migration', 'preview_migration']) {
    const schema = tools.get(name).inputSchema;
    assert.deepEqual(schema.required, ['files']);
    assert.equal(schema.properties.files.maxItems, MAX_FILES);
    assert.equal(schema.properties.mode.default, 'cold');
    assert.equal(schema.properties.framework.default, 'preserve');
    assert.equal(schema.properties.files.items.additionalProperties, false);
  }
  assert.deepEqual(tools.get('validate_migration_contract').inputSchema.required, ['manifest']);

  const capabilities = await call(client, 'migration_capabilities', {});
  assert.equal(capabilities.engineVersion, '9.0.0-beta.1');
  assert.equal(capabilities.registryVersion, '1.1.0');
  assert.deepEqual(capabilities.limits, { maxFiles: MAX_FILES, maxFileBytes: MAX_FILE_BYTES, maxTotalBytes: MAX_TOTAL_BYTES });

  const source = "import { map } from 'rxjs/operators';\nconst result = source.pipe(map(value => value));\n";
  const analysis = await call(client, 'analyze_migration', {
    files: [{ path: 'src/example.ts', source }],
    provenance: { repository: 'https://example.test/project.git', sha: 'abc123' },
  });
  assert.equal(analysis.files[0].path, 'src/example.ts');
  assert.equal(analysis.files[0].lifecycle, 'cold');
  assert.equal(analysis.files[0].status, 'changed');
  assert(!Object.hasOwn(analysis.files[0], 'candidateSource'), 'analysis must not return candidate source');

  const preview = await call(client, 'preview_migration', {
    files: [{ path: 'src/example.ts', source }],
    provenance: { repository: 'https://example.test/project.git', sha: 'abc123' },
  });
  assert.equal(preview.files[0].status, 'changed');
  assert.match(preview.files[0].candidateSource, /source\[map\]/);
  assert.match(preview.files[0].candidateSource, /Migrated from https:\/\/example\.test\/project\.git @ abc123/);

  const frameworkPreview = await call(client, 'preview_migration', {
    files: [{ path: 'test/assertion.ts', source: "import { expect } from 'chai'; expect(1).to.equal(1);" }],
    framework: 'mocha-chai-to-vitest',
  });
  assert.match(frameworkPreview.files[0].candidateSource, /toBe\(1\)/);

  const malformedSource = "import { map } from 'rxjs/operators'; const result = source.pipe(map(;";
  const safeStop = await call(client, 'preview_migration', {
    files: [{ path: 'src/malformed.ts', source: malformedSource }],
  });
  assert.equal(safeStop.files[0].status, 'refused');
  assert.equal(safeStop.files[0].candidateSource, malformedSource);
  assert.equal(safeStop.files[0].diagnostics[0].code, 'malformed-source');

  const invalidContract = await call(client, 'validate_migration_contract', { manifest: { schemaVersion: 1 } });
  assert.equal(invalidContract.valid, false);
  assert.equal(invalidContract.readiness, null);
  assert(invalidContract.issues.length > 0);

  const readyContract = await call(client, 'validate_migration_contract', { manifest: validManifest() });
  assert.deepEqual(readyContract, {
    schemaVersion: 1,
    valid: true,
    issues: [],
    readiness: { state: 'ready', findings: [] },
  });

  const countBoundary = await call(client, 'analyze_migration', {
    files: Array.from({ length: MAX_FILES }, (_, index) => ({ path: `src/count-${index}.ts`, source: '' })),
  });
  assert.equal(countBoundary.files.length, MAX_FILES);

  const fileBoundary = await call(client, 'preview_migration', {
    files: [{ path: 'src/file-boundary.ts', source: ' '.repeat(MAX_FILE_BYTES) }],
  });
  assert.equal(fileBoundary.files[0].status, 'unchanged');

  const totalBoundary = await call(client, 'preview_migration', {
    files: Array.from({ length: MAX_TOTAL_BYTES / MAX_FILE_BYTES }, (_, index) => ({
      path: `src/total-${index}.ts`,
      source: ' '.repeat(MAX_FILE_BYTES),
    })),
  });
  assert.equal(totalBoundary.files.length, MAX_TOTAL_BYTES / MAX_FILE_BYTES);

  await refusal(client, 'invalid-path', {
    files: [
      { path: 'src/valid.ts', source },
      { path: '../escape.ts', source: '' },
    ],
  });
  await refusal(client, 'duplicate-path', {
    files: [
      { path: 'src/file.ts', source: '' },
      { path: 'src\\file.ts', source: '' },
    ],
  });
  await refusal(client, 'file-too-large', {
    files: [{ path: 'src/large.ts', source: '😀'.repeat(MAX_FILE_BYTES / 2 + 1) }],
  });
  await refusal(client, 'batch-too-large', {
    files: Array.from({ length: 5 }, (_, index) => ({ path: `src/large-${index}.ts`, source: ' '.repeat(450 * 1024) })),
  });

  const malformedInputs = [
    {},
    { files: [] },
    { files: 'not-an-array' },
    { files: [{ path: 'src/file.ts' }] },
    { files: [{ path: 'src/file.ts', source: '', extra: true }] },
    { files: [{ path: 'src/file.ts', source: '' }], extra: true },
    { files: [{ path: 'src/file.ts', source: '' }], mode: 'shared' },
    { files: [{ path: 'src/file.ts', source: '' }], framework: 'jest' },
    { files: [{ path: 'src/file.ts', source: '' }], provenance: { repository: 'repo-only' } },
    { files: Array.from({ length: MAX_FILES + 1 }, (_, index) => ({ path: `src/${index}.ts`, source: '' })) },
  ];
  for (const arguments_ of malformedInputs) {
    await protocolRefusal(client, 'preview_migration', arguments_);
  }
  await protocolRefusal(client, 'validate_migration_contract', {});

  await client.close();
  assert((await readdir(packageRoot)).includes('dist'));
  console.log(
    `Packed artifact contains ${names.length} reviewed files; all four tools, schemas, metadata, boundaries, refusals, and shutdown passed.`
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}

async function call(client, name, arguments_) {
  const result = await client.callTool({ name, arguments: arguments_ });
  assert.equal(result.isError, undefined, `${name} unexpectedly returned an error`);
  assert.equal(result.content.length, 1);
  assert.equal(result.content[0].type, 'text');
  const parsedText = JSON.parse(result.content[0].text);
  assert.deepEqual(result.structuredContent, parsedText, `${name} text and structured content diverged`);
  return parsedText;
}

async function refusal(client, code, arguments_) {
  const result = await client.callTool({ name: 'preview_migration', arguments: arguments_ });
  assert.equal(result.isError, true);
  assert.equal(result.content.length, 1);
  assert.equal(result.content[0].type, 'text');
  const parsedText = JSON.parse(result.content[0].text);
  assert.deepEqual(result.structuredContent, parsedText, `${code} text and structured refusal diverged`);
  assert.deepEqual(parsedText, {
    code,
    message: parsedText.message,
    limits: { maxFiles: MAX_FILES, maxFileBytes: MAX_FILE_BYTES, maxTotalBytes: MAX_TOTAL_BYTES },
  });
}

async function protocolRefusal(client, name, arguments_) {
  const result = await client.callTool({ name, arguments: arguments_ });
  assert.equal(result.isError, true, `packed MCP accepted malformed input: ${JSON.stringify(arguments_).slice(0, 200)}`);
  assert.equal(result.content.length, 1);
  assert.equal(result.content[0].type, 'text');
  assert.match(result.content[0].text, /Input validation error/);
  assert.equal(result.structuredContent, undefined, 'protocol validation must not produce partial tool output');
}

function validManifest() {
  const span = {
    file: 'src/example.ts',
    start: { offset: 0, line: 1, column: 1 },
    end: { offset: 1, line: 1, column: 2 },
  };
  const verification = {
    id: 'tests',
    command: 'pnpm test',
    environment: { node: '22.13.0' },
    status: 'passed',
    exitCode: 0,
    summary: 'Passed.',
  };
  return {
    schemaVersion: 1,
    engineVersion: '9.0.0-beta.1',
    capabilityRegistryVersion: '1.1.0',
    skillDigest: '0'.repeat(64),
    sourceRxjsVersion: '7.8.2',
    targetRxjsVersion: '9.0.0-beta.1',
    baseline: [verification],
    units: [
      {
        id: 'pipeline-1',
        sourceLocations: [span],
        lifecycle: 'platform-shared',
        evidenceClassification: 'portable',
        claims: ['Emits one mapped value.'],
        approval: {
          status: 'approved',
          approvedBy: 'maintainer',
          approvedAt: '2026-08-07T00:00:00.000Z',
          rationale: 'The platform-shared lifecycle is intentional.',
        },
      },
    ],
    diagnostics: [],
    intentionalDivergences: [],
    verification: [verification],
    blockers: [],
  };
}
