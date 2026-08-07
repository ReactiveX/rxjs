import { z } from 'zod';
import {
  analyzeTestSource,
  assessMigrationContractReadiness,
  capabilityRegistrySchemaVersion,
  capabilityRegistryVersion,
  defaultCapabilityRegistry,
  migrationContractManifestSchema,
  migrationContractSchemaVersion,
  migrationEngineVersion,
  migrateTestSource,
  mochaChaiToVitestAdapter,
} from '../migration/index.js';
import type { MigrationMode, SourceProvenance } from '../migration/index.js';

export const MAX_FILES = 25;
export const MAX_FILE_BYTES = 512 * 1024;
export const MAX_TOTAL_BYTES = 2 * 1024 * 1024;

export const sourceFileSchema = z
  .object({
    path: z.string().min(1),
    source: z.string(),
  })
  .strict();

export const batchSchema = z
  .object({
    files: z.array(sourceFileSchema).min(1).max(MAX_FILES),
    mode: z.enum(['cold', 'platform']).optional(),
    framework: z.enum(['preserve', 'mocha-chai-to-vitest']).default('preserve'),
    provenance: z
      .object({
        repository: z.string().min(1),
        sha: z.string().min(1),
      })
      .strict()
      .optional(),
  })
  .strict();

export interface InputRefusalShape {
  readonly code: 'invalid-input' | 'invalid-path' | 'duplicate-path' | 'file-too-large' | 'batch-too-large';
  readonly message: string;
  readonly limits: {
    readonly maxFiles: number;
    readonly maxFileBytes: number;
    readonly maxTotalBytes: number;
  };
}

export class InputRefusal extends Error {
  constructor(readonly refusal: InputRefusalShape) {
    super(refusal.message);
  }
}

export type BatchInput = z.input<typeof batchSchema>;

export function migrationCapabilities() {
  return {
    schemaVersion: capabilityRegistrySchemaVersion,
    registryVersion: capabilityRegistryVersion,
    engineVersion: migrationEngineVersion,
    sourceVersion: '7.8.2',
    sourceRevision: 'e5351d02e225e275ac0e497c7b66eaa5f0c88791',
    targetVersion: '9.0.0-beta.1',
    limits: limits(),
    capabilities: defaultCapabilityRegistry.capabilities,
  };
}

export function analyzeMigration(input: BatchInput) {
  const batch = validateBatch(input);
  return {
    schemaVersion: 1,
    engineVersion: migrationEngineVersion,
    files: batch.files.map(({ path, source }) => {
      const analysis = analyzeTestSource(source, { mode: batch.mode });
      const preview = migrateTestSource(source, migrationOptions(batch, path));
      return {
        path,
        lifecycle: analysis.mode,
        testSchedulerVariables: analysis.testSchedulerVariables,
        helpers: analysis.helpers,
        importedOperators: analysis.importedOperators,
        unsupportedConstructs: analysis.missingCapabilities,
        reviewFlags: analysis.reviewFlags,
        status: preview.status,
        diagnostics: preview.diagnostics,
      };
    }),
  };
}

export function previewMigration(input: BatchInput) {
  const batch = validateBatch(input);
  return {
    schemaVersion: 1,
    engineVersion: migrationEngineVersion,
    files: batch.files.map(({ path, source }) => {
      const result = migrateTestSource(source, migrationOptions(batch, path));
      return {
        path,
        status: result.status,
        candidateSource: result.code,
        imports: result.imports,
        diagnostics: result.diagnostics,
      };
    }),
  };
}

export function validateMigrationContract(manifest: unknown) {
  const parsed = migrationContractManifestSchema.safeParse(manifest);
  if (!parsed.success) {
    return {
      schemaVersion: migrationContractSchemaVersion,
      valid: false,
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      readiness: null,
    };
  }
  return {
    schemaVersion: migrationContractSchemaVersion,
    valid: true,
    issues: [],
    readiness: assessMigrationContractReadiness(parsed.data),
  };
}

function validateBatch(input: BatchInput): z.output<typeof batchSchema> {
  const parsed = batchSchema.safeParse(input);
  if (!parsed.success) {
    throw refusal('invalid-input', parsed.error.issues[0]?.message ?? 'The request does not match the batch schema.');
  }
  const seen = new Set<string>();
  let totalBytes = 0;
  for (const file of parsed.data.files) {
    if (!isRepositoryRelativePath(file.path)) {
      throw refusal('invalid-path', `File path must be repository-relative without parent traversal: ${file.path}`);
    }
    const normalized = file.path.replaceAll('\\', '/');
    if (seen.has(normalized)) throw refusal('duplicate-path', `The batch contains a duplicate path: ${file.path}`);
    seen.add(normalized);
    const fileBytes = Buffer.byteLength(file.source, 'utf8');
    if (fileBytes > MAX_FILE_BYTES) {
      throw refusal('file-too-large', `${file.path} is ${fileBytes} bytes; the per-file limit is ${MAX_FILE_BYTES} bytes.`);
    }
    totalBytes += fileBytes;
  }
  if (totalBytes > MAX_TOTAL_BYTES) {
    throw refusal('batch-too-large', `The batch is ${totalBytes} bytes; the total limit is ${MAX_TOTAL_BYTES} bytes.`);
  }
  return parsed.data;
}

function migrationOptions(batch: z.output<typeof batchSchema>, path: string) {
  const provenance: SourceProvenance | undefined = batch.provenance
    ? { repository: batch.provenance.repository ?? '', sha: batch.provenance.sha ?? '', path }
    : undefined;
  return {
    mode: batch.mode as MigrationMode | undefined,
    fileName: path,
    provenance,
    frameworkAdapter: batch.framework === 'mocha-chai-to-vitest' ? mochaChaiToVitestAdapter : undefined,
  };
}

function isRepositoryRelativePath(value: string): boolean {
  if (value.startsWith('/') || /^[A-Za-z]:[\\/]/.test(value)) return false;
  const segments = value.split(/[\\/]/);
  return segments.every((segment) => segment.length > 0 && segment !== '.' && segment !== '..');
}

function limits() {
  return { maxFiles: MAX_FILES, maxFileBytes: MAX_FILE_BYTES, maxTotalBytes: MAX_TOTAL_BYTES };
}

function refusal(code: InputRefusalShape['code'], message: string): InputRefusal {
  return new InputRefusal({ code, message, limits: limits() });
}
