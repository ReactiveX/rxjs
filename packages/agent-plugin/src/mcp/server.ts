import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  InputRefusal,
  analyzeMigration,
  batchSchema,
  migrationCapabilities,
  previewMigration,
  validateMigrationContract,
} from './service.js';

const readOnlyAnnotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

export function createRxjsMcpServer(): McpServer {
  const server = new McpServer({ name: 'rxjs-migration', version: '9.0.0-beta.1' });

  server.registerTool(
    'migration_capabilities',
    {
      description:
        'Return complete RxJS 7 public-surface migration guidance plus the smaller fixture-proved rewrite registry, lifecycle policy, limits, and engine versions.',
      inputSchema: {},
      annotations: readOnlyAnnotations,
    },
    async () => success(migrationCapabilities())
  );

  server.registerTool(
    'analyze_migration',
    {
      description:
        'Analyze explicit source contents for complete import-surface guidance, subscriber topology, sharing candidates, lifecycle recommendations, unsupported constructs, and structured diagnostics.',
      inputSchema: batchSchema.shape,
      annotations: readOnlyAnnotations,
    },
    async (input) => call(() => analyzeMigration(input))
  );

  server.registerTool(
    'preview_migration',
    {
      description:
        'Return cold-by-default candidate source, imports, and diagnostics without reading or writing project files; platform mode must be selected explicitly.',
      inputSchema: batchSchema.shape,
      annotations: readOnlyAnnotations,
    },
    async (input) => call(() => previewMigration(input))
  );

  server.registerTool(
    'validate_migration_contract',
    {
      description: 'Validate migration-contract schema independently from migration readiness.',
      inputSchema: { manifest: z.unknown() },
      annotations: readOnlyAnnotations,
    },
    async ({ manifest }) => success(validateMigrationContract(manifest))
  );

  return server;
}

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await createRxjsMcpServer().connect(transport);
}

function call(operation: () => unknown) {
  try {
    return success(operation());
  } catch (error) {
    if (error instanceof InputRefusal) return failure(error.refusal);
    throw error;
  }
}

function success(value: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
    structuredContent: value as Record<string, unknown>,
  };
}

function failure(value: unknown) {
  return {
    isError: true,
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
    structuredContent: value as Record<string, unknown>,
  };
}

main().catch((error: unknown) => {
  process.stderr.write(`RxJS migration MCP failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
