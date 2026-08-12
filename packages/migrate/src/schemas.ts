import { z } from 'zod';
import {
  approvalStates,
  argumentAdapters,
  capabilityPreconditions,
  capabilityStatuses,
  compatibilityClassifications,
  diagnosticDispositions,
  diagnosticNextActions,
  diagnosticSeverities,
  migrationDiagnosticCodes,
  refusalScopes,
  targetLifecycles,
  verificationStatuses,
  type CapabilityRegistry,
  type ContractReadinessAssessment,
  type MigrationContractManifest,
} from './types.js';
import { capabilityRegistryVersion, migrationEngineVersion } from './version.js';

const nonEmptyString = z.string().min(1);
const relativePath = nonEmptyString.refine(
  (value) => !value.startsWith('/') && !/^[A-Za-z]:[\\/]/.test(value) && !value.split(/[\\/]/).includes('..'),
  { message: 'Expected a repository-relative path without parent traversal.' }
);

export const sourcePositionSchema = z
  .object({
    offset: z.number().int().nonnegative(),
    line: z.number().int().positive(),
    column: z.number().int().positive(),
  })
  .strict();

export const sourceSpanSchema = z
  .object({
    file: relativePath,
    start: sourcePositionSchema,
    end: sourcePositionSchema,
  })
  .strict()
  .refine((span) => span.end.offset >= span.start.offset, { message: 'The end offset must not precede the start offset.' });

export const capabilityMappingSchema = z
  .object({
    id: nonEmptyString,
    legacyName: nonEmptyString,
    symbolName: nonEmptyString,
    module: nonEmptyString,
    argumentAdapter: z.enum(argumentAdapters),
    status: z.enum(capabilityStatuses),
    arity: z
      .object({ minimum: z.number().int().nonnegative(), maximum: z.number().int().nonnegative().nullable() })
      .strict()
      .refine(({ minimum, maximum }) => maximum === null || maximum >= minimum, {
        message: 'The maximum arity must not be smaller than the minimum arity.',
      }),
    preconditions: z.array(z.enum(capabilityPreconditions)).min(1).readonly(),
    review: nonEmptyString.optional(),
    evidence: z
      .object({
        fixtureIds: z.array(nonEmptyString).min(1).readonly(),
        classifications: z.array(z.enum(compatibilityClassifications)).min(1).readonly(),
      })
      .strict(),
  })
  .strict();

export const capabilityRegistrySchema: z.ZodType<CapabilityRegistry> = z
  .object({
    schemaVersion: z.literal(1),
    registryVersion: nonEmptyString,
    engineVersion: nonEmptyString,
    capabilities: z.array(capabilityMappingSchema).readonly(),
  })
  .strict()
  .superRefine((registry, context) => {
    const ids = new Set<string>();
    const names = new Set<string>();
    for (let index = 0; index < registry.capabilities.length; index++) {
      const capability = registry.capabilities[index];
      if (!capability) continue;
      if (ids.has(capability.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['capabilities', index, 'id'],
          message: `Duplicate capability ID: ${capability.id}`,
        });
      }
      ids.add(capability.id);
      if (names.has(capability.legacyName)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['capabilities', index, 'legacyName'],
          message: `Duplicate legacy capability: ${capability.legacyName}`,
        });
      }
      names.add(capability.legacyName);
    }
  });

export const migrationDiagnosticSchema = z
  .object({
    id: nonEmptyString,
    code: z.enum(migrationDiagnosticCodes),
    message: nonEmptyString,
    severity: z.enum(diagnosticSeverities),
    disposition: z.enum(diagnosticDispositions),
    refusalScope: z.enum(refusalScopes),
    classification: z.enum(compatibilityClassifications),
    span: sourceSpanSchema,
    nextAction: z.object({ code: z.enum(diagnosticNextActions), message: nonEmptyString }).strict(),
    capabilityId: nonEmptyString.optional(),
  })
  .strict();

export const verificationResultSchema = z
  .object({
    id: nonEmptyString,
    command: nonEmptyString,
    environment: z.record(z.string()),
    status: z.enum(verificationStatuses),
    exitCode: z.number().int().nullable(),
    summary: nonEmptyString,
  })
  .strict();

export const migrationContractUnitSchema = z
  .object({
    id: nonEmptyString,
    sourceLocations: z.array(sourceSpanSchema).min(1).readonly(),
    lifecycle: z.enum(targetLifecycles),
    evidenceClassification: z.enum(compatibilityClassifications),
    claims: z.array(nonEmptyString).min(1).readonly(),
    approval: z
      .object({
        status: z.enum(approvalStates),
        approvedBy: nonEmptyString.optional(),
        approvedAt: z.string().datetime().optional(),
        rationale: nonEmptyString.optional(),
      })
      .strict(),
  })
  .strict()
  .superRefine((unit, context) => validateApproval(unit.approval, context, ['approval']));

export const intentionalDivergenceSchema = z
  .object({
    unitIds: z.array(nonEmptyString).min(1).readonly(),
    previousClaim: nonEmptyString,
    nextClaim: nonEmptyString,
    userImpact: nonEmptyString,
    evidence: z.array(nonEmptyString).min(1).readonly(),
    approval: z
      .object({
        status: z.enum(approvalStates),
        approvedBy: nonEmptyString.optional(),
        approvedAt: z.string().datetime().optional(),
        rationale: nonEmptyString.optional(),
      })
      .strict(),
  })
  .strict()
  .superRefine((divergence, context) => validateApproval(divergence.approval, context, ['approval']));

export const migrationBlockerSchema = z
  .object({
    owner: nonEmptyString,
    reason: nonEmptyString,
    unitIds: z.array(nonEmptyString).min(1).readonly(),
    evidence: z.array(nonEmptyString).min(1).readonly(),
    accepted: z.boolean(),
  })
  .strict();

export const migrationContractManifestSchema: z.ZodType<MigrationContractManifest> = z
  .object({
    schemaVersion: z.literal(1),
    engineVersion: nonEmptyString,
    capabilityRegistryVersion: nonEmptyString,
    skillDigest: z.string().regex(/^[a-f0-9]{64}$/),
    sourceRxjsVersion: nonEmptyString,
    targetRxjsVersion: nonEmptyString,
    baseline: z.array(verificationResultSchema).min(1).readonly(),
    units: z.array(migrationContractUnitSchema).min(1).readonly(),
    diagnostics: z.array(migrationDiagnosticSchema).readonly(),
    intentionalDivergences: z.array(intentionalDivergenceSchema).readonly(),
    verification: z.array(verificationResultSchema).readonly(),
    blockers: z.array(migrationBlockerSchema).readonly(),
  })
  .strict()
  .superRefine((manifest, context) => {
    const unitIds = new Set<string>();
    for (let index = 0; index < manifest.units.length; index++) {
      const unit = manifest.units[index];
      if (!unit) continue;
      if (unitIds.has(unit.id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['units', index, 'id'], message: `Duplicate unit ID: ${unit.id}` });
      }
      unitIds.add(unit.id);
      if ((unit.lifecycle === 'unresolved' || unit.lifecycle === 'unsupported') && unit.approval.status === 'not-required') {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['units', index, 'approval'],
          message: `${unit.lifecycle} units require an explicit approval state.`,
        });
      }
    }
    for (const [collectionName, records] of [
      ['intentionalDivergences', manifest.intentionalDivergences],
      ['blockers', manifest.blockers],
    ] as const) {
      for (let recordIndex = 0; recordIndex < records.length; recordIndex++) {
        const record = records[recordIndex];
        if (!record) continue;
        for (let unitIndex = 0; unitIndex < record.unitIds.length; unitIndex++) {
          const unitId = record.unitIds[unitIndex];
          if (unitId && !unitIds.has(unitId)) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: [collectionName, recordIndex, 'unitIds', unitIndex],
              message: `Unknown migration unit: ${unitId}`,
            });
          }
        }
      }
    }
  });

export function parseCapabilityRegistry(input: unknown): CapabilityRegistry {
  return capabilityRegistrySchema.parse(input);
}

export function parseMigrationContractManifest(input: unknown): MigrationContractManifest {
  return migrationContractManifestSchema.parse(input);
}

export function assessMigrationContractReadiness(
  manifest: MigrationContractManifest,
  options: { readonly expectedSkillDigest?: string } = {}
): ContractReadinessAssessment {
  const findings: ContractReadinessAssessment['findings'][number][] = [];
  const add = (code: ContractReadinessAssessment['findings'][number]['code'], path: string, message: string): void => {
    findings.push({ code, path, message });
  };

  if (manifest.engineVersion !== migrationEngineVersion) {
    add('engine-version-mismatch', 'engineVersion', `Expected ${migrationEngineVersion}, received ${manifest.engineVersion}.`);
  }
  if (manifest.capabilityRegistryVersion !== capabilityRegistryVersion) {
    add(
      'capability-registry-version-mismatch',
      'capabilityRegistryVersion',
      `Expected ${capabilityRegistryVersion}, received ${manifest.capabilityRegistryVersion}.`
    );
  }
  if (options.expectedSkillDigest && manifest.skillDigest !== options.expectedSkillDigest) {
    add('skill-digest-mismatch', 'skillDigest', 'The manifest Skill digest does not match the installed canonical Skill.');
  }
  manifest.baseline.forEach((result, index) => {
    if (result.status === 'failed' || result.status === 'not-run') {
      add('baseline-not-green', `baseline.${index}`, `Baseline ${result.id} is ${result.status}.`);
    }
  });
  if (manifest.verification.length === 0) add('verification-missing', 'verification', 'No post-migration verification was recorded.');
  manifest.verification.forEach((result, index) => {
    if (result.status === 'failed' || result.status === 'not-run') {
      add('verification-not-green', `verification.${index}`, `Verification ${result.id} is ${result.status}.`);
    }
  });
  manifest.units.forEach((unit, index) => {
    if (unit.lifecycle === 'unresolved') add('unit-unresolved', `units.${index}.lifecycle`, `Unit ${unit.id} has no selected lifecycle.`);
    if (unit.lifecycle === 'unsupported') add('unit-unsupported', `units.${index}.lifecycle`, `Unit ${unit.id} is unsupported.`);
    if (unit.approval.status === 'pending') add('approval-pending', `units.${index}.approval`, `Unit ${unit.id} is pending approval.`);
  });
  manifest.diagnostics.forEach((diagnostic, index) => {
    if (diagnostic.disposition !== 'informational') {
      add('diagnostic-unresolved', `diagnostics.${index}`, `Diagnostic ${diagnostic.id} still requires resolution or escalation.`);
    }
  });
  manifest.intentionalDivergences.forEach((divergence, index) => {
    if (divergence.approval.status !== 'approved') {
      add('divergence-unapproved', `intentionalDivergences.${index}.approval`, 'An intentional divergence is not approved.');
    }
  });
  manifest.blockers.forEach((blocker, index) => {
    add(
      blocker.accepted ? 'blocker-accepted' : 'blocker-unaccepted',
      `blockers.${index}`,
      blocker.accepted ? `Accepted blocker remains: ${blocker.reason}` : `Unaccepted blocker remains: ${blocker.reason}`
    );
  });

  const incomplete = findings.some(({ code }) => code !== 'blocker-accepted' && code !== 'unit-unsupported');
  const acceptedBlockers = findings.some(({ code }) => code === 'blocker-accepted' || code === 'unit-unsupported');
  return { state: incomplete ? 'incomplete' : acceptedBlockers ? 'ready-with-accepted-blockers' : 'ready', findings };
}

function validateApproval(
  approval: { readonly status: string; readonly approvedBy?: string; readonly approvedAt?: string; readonly rationale?: string },
  context: z.RefinementCtx,
  path: readonly (string | number)[]
): void {
  if (approval.status !== 'approved') return;
  if (!approval.approvedBy) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: [...path, 'approvedBy'], message: 'Approved work requires an approver.' });
  }
  if (!approval.approvedAt) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [...path, 'approvedAt'],
      message: 'Approved work requires an approval timestamp.',
    });
  }
  if (!approval.rationale) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: [...path, 'rationale'], message: 'Approved work requires a rationale.' });
  }
}
