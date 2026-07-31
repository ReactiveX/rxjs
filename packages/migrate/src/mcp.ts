#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { analyzeTestSource } from './analyze.js';
import { migrateTestSource } from './index.js';
import { mochaChaiToVitestAdapter } from './mocha-chai-vitest.js';
import type { CapabilityMapping } from './types.js';

const capabilitySchema = z.object({
  legacyName: z.string(),
  symbolName: z.string(),
  module: z.string(),
  argumentAdapter: z.enum(['identity', 'first-argument', 'buffer-count', 'concat-map', 'concat-all', 'switch-all', 'audit', 'audit-time']),
  status: z.enum(['exact', 'unified', 'partial']),
  review: z.string().optional(),
});

const sourceSchema = {
  source: z.string().describe('Complete TypeScript test source. Filesystem paths are not accepted.'),
  mode: z.enum(['cold', 'platform']).optional(),
  capabilities: z.array(capabilitySchema).optional(),
};

export function createMigrationMcpServer(): McpServer {
  const server = new McpServer({ name: '@rxjs/migrate', version: '8.0.0-alpha.14' });

  server.registerTool(
    'analyze_test_source',
    {
      title: 'Analyze an RxJS 7 TestScheduler source file',
      description: 'Read-only analysis of source content. Reports helpers, lifecycle review flags, and capability gaps without changing files.',
      inputSchema: sourceSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ source, mode, capabilities }) => textResult(analyzeTestSource(source, { mode, capabilities: capabilities as CapabilityMapping[] | undefined }))
  );

  server.registerTool(
    'migrate_test_source',
    {
      title: 'Dry-run an RxJS 7 TestScheduler migration',
      description: 'Transforms supplied source content and returns migrated source plus diagnostics. This tool never reads or writes the filesystem.',
      inputSchema: {
        ...sourceSchema,
        provenance: z.object({ repository: z.string(), sha: z.string(), path: z.string() }),
        framework: z.enum(['preserve', 'mocha-chai-vitest']).optional(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ source, mode, capabilities, provenance, framework }) => {
      const result = migrateTestSource(source, {
        mode,
        capabilities: capabilities as CapabilityMapping[] | undefined,
        provenance,
        frameworkAdapter: framework === 'mocha-chai-vitest' ? mochaChaiToVitestAdapter : undefined,
      });
      return textResult(result);
    }
  );

  return server;
}

export async function runMigrationMcpServer(): Promise<void> {
  const server = createMigrationMcpServer();
  await server.connect(new StdioServerTransport());
}

function textResult(value: unknown): { content: [{ type: 'text'; text: string }] } {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/mcp.js')) {
  runMigrationMcpServer().catch((error: unknown) => {
    process.stderr.write(`rxjs-migrate-mcp: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
