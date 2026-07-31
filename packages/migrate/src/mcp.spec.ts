import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, describe, expect, it } from 'vitest';
import { createMigrationMcpServer } from './mcp.js';

describe('migration MCP server', () => {
  const close: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const work of close.splice(0)) await work();
  });

  it('registers bounded source-content analysis and migration tools', async () => {
    const server = createMigrationMcpServer();
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    close.push(() => client.close(), () => server.close());

    const tools = await client.listTools();
    expect(tools.tools.map(({ name }) => name)).toEqual(['analyze_test_source', 'migrate_test_source']);

    const response = await client.callTool({
      name: 'migrate_test_source',
      arguments: {
        source: `import { TestScheduler } from 'rxjs/testing'; let scheduler: TestScheduler; it('x', () => scheduler.run(({ cold }) => cold('-a|')));`,
        mode: 'cold',
        provenance: { repository: 'https://example.test/repo.git', sha: 'abc', path: 'test/x.ts' },
      },
    });
    const first = response.content[0];
    expect(first?.type).toBe('text');
    if (first?.type !== 'text') throw new Error('Expected a text MCP result.');
    expect(first.text).toContain('await rxTest');
    expect(first.text).toContain('https://example.test/repo.git');
  });
});
