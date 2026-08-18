import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const adapter = resolve(root, 'claude-adapter');
await rm(adapter, { recursive: true, force: true });
await mkdir(resolve(adapter, '.claude-plugin'), { recursive: true });
await cp(resolve(root, 'skills'), resolve(adapter, 'skills'), { recursive: true });
await mkdir(resolve(adapter, 'dist'), { recursive: true });
await cp(resolve(root, 'dist/mcp-server.cjs'), resolve(adapter, 'dist/mcp-server.cjs'));
await cp(resolve(root, 'dist/knowledge-digests.json'), resolve(adapter, 'dist/knowledge-digests.json'));
await cp(resolve(root, 'LICENSE'), resolve(adapter, 'LICENSE'));

await writeFile(
  resolve(adapter, '.claude-plugin/plugin.json'),
  `${JSON.stringify(
    {
      name: 'rxjs',
      version: '9.0.0-beta.1',
      description: 'Official RxJS 7 and RxJS 9 skills and read-only migration tools.',
      author: { name: 'RxJS Core Team' },
      homepage: 'https://rxjs.dev/agent-plugin',
      repository: 'https://github.com/ReactiveX/rxjs',
      license: 'Apache-2.0',
    },
    null,
    2
  )}\n`
);
await writeFile(
  resolve(adapter, '.mcp.json'),
  `${JSON.stringify(
    {
      mcpServers: {
        'rxjs-migration': {
          command: 'node',
          args: ['${CLAUDE_PLUGIN_ROOT}/dist/mcp-server.cjs'],
          cwd: '${CLAUDE_PLUGIN_ROOT}',
        },
      },
    },
    null,
    2
  )}\n`
);

async function files(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await files(path)));
    else output.push(path);
  }
  return output;
}
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const universalPaths = [
  resolve(root, 'dist/mcp-server.cjs'),
  resolve(root, 'dist/knowledge-digests.json'),
  ...(await files(resolve(root, 'skills'))),
].sort();
const artifacts = {};
for (const universalPath of universalPaths) {
  const universalRelative = relative(root, universalPath);
  const adapterPath = resolve(adapter, universalRelative);
  const [universalBytes, adapterBytes] = await Promise.all([readFile(universalPath), readFile(adapterPath)]);
  const universalDigest = sha256(universalBytes);
  const adapterDigest = sha256(adapterBytes);
  if (universalDigest !== adapterDigest) throw new Error(`Claude adapter differs from universal artifact: ${universalRelative}`);
  artifacts[universalRelative] = { sha256: universalDigest, bytes: universalBytes.byteLength };
}
await writeFile(
  resolve(adapter, 'artifact-digests.json'),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      name: 'rxjs',
      version: '9.0.0-beta.1',
      universalPackage: '@rxjs/agent-plugin',
      artifacts,
    },
    null,
    2
  )}\n`
);
