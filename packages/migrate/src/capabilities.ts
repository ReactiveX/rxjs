import type { CapabilityMapping, CapabilityRegistry } from './types.js';
import { capabilityRegistrySchemaVersion, capabilityRegistryVersion, migrationEngineVersion } from './version.js';

const exactOperators = [
  'filter',
  'map',
  'takeUntil',
] as const;

const exactArities = {
  filter: { minimum: 1, maximum: 2 },
  map: { minimum: 1, maximum: 2 },
  takeUntil: { minimum: 1, maximum: 1 },
} as const;

const moduleName = (name: string): string => name.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);

const exactMappings = exactOperators.map(
  (legacyName): CapabilityMapping => ({
    id: `operator.${moduleName(legacyName)}`,
    legacyName,
    symbolName: legacyName,
    module: moduleName(legacyName),
    argumentAdapter: 'identity',
    status: 'exact',
    arity: exactArities[legacyName],
    preconditions: ['direct-pipe-call', 'unshadowed-import-binding', 'supported-arity'],
    evidence: { fixtureIds: [`operator.${moduleName(legacyName)}`], classifications: ['portable'] },
  })
);

const unifiedMappings = [
  {
    id: 'operator.buffer-count',
    legacyName: 'bufferCount',
    symbolName: 'buffer',
    module: 'buffer',
    argumentAdapter: 'buffer-count',
    status: 'unified',
    arity: { minimum: 1, maximum: 2 },
    preconditions: ['direct-pipe-call', 'unshadowed-import-binding', 'supported-arity'],
    evidence: { fixtureIds: ['operator.buffer-count'], classifications: ['portable'] },
  },
  {
    id: 'operator.concat-map',
    legacyName: 'concatMap',
    symbolName: 'mergeMap',
    module: 'merge-map',
    argumentAdapter: 'concat-map',
    status: 'partial',
    arity: { minimum: 1, maximum: 1 },
    preconditions: ['direct-pipe-call', 'unshadowed-import-binding', 'supported-arity', 'no-result-selector'],
    evidence: { fixtureIds: ['operator.concat-map'], classifications: ['compatibility-only'] },
    review: 'Result-selector overloads require review.',
  },
  {
    id: 'operator.concat-all',
    legacyName: 'concatAll',
    symbolName: 'mergeMap',
    module: 'merge-map',
    argumentAdapter: 'concat-all',
    status: 'unified',
    arity: { minimum: 0, maximum: 0 },
    preconditions: ['direct-pipe-call', 'unshadowed-import-binding', 'supported-arity'],
    evidence: { fixtureIds: ['operator.concat-all'], classifications: ['portable'] },
  },
  {
    id: 'operator.switch-all',
    legacyName: 'switchAll',
    symbolName: 'switchMap',
    module: 'switch-map',
    argumentAdapter: 'switch-all',
    status: 'unified',
    arity: { minimum: 0, maximum: 0 },
    preconditions: ['direct-pipe-call', 'unshadowed-import-binding', 'supported-arity'],
    evidence: { fixtureIds: ['operator.switch-all'], classifications: ['portable'] },
  },
  {
    id: 'operator.debounce-time',
    legacyName: 'debounceTime',
    symbolName: 'debounce',
    module: 'debounce',
    argumentAdapter: 'first-argument',
    status: 'partial',
    arity: { minimum: 1, maximum: 1 },
    preconditions: ['direct-pipe-call', 'unshadowed-import-binding', 'supported-arity', 'no-scheduler-argument'],
    evidence: { fixtureIds: ['operator.debounce-time'], classifications: ['compatibility-only'] },
    review: 'Scheduler arguments are not part of the RxJS Next contract.',
  },
  {
    id: 'operator.audit',
    legacyName: 'audit',
    symbolName: 'throttle',
    module: 'throttle',
    argumentAdapter: 'audit',
    status: 'unified',
    arity: { minimum: 1, maximum: 1 },
    preconditions: ['direct-pipe-call', 'unshadowed-import-binding', 'supported-arity'],
    evidence: { fixtureIds: ['operator.audit'], classifications: ['portable'] },
  },
  {
    id: 'operator.audit-time',
    legacyName: 'auditTime',
    symbolName: 'throttle',
    module: 'throttle',
    argumentAdapter: 'audit-time',
    status: 'partial',
    arity: { minimum: 1, maximum: 1 },
    preconditions: ['direct-pipe-call', 'unshadowed-import-binding', 'supported-arity', 'no-scheduler-argument'],
    evidence: { fixtureIds: ['operator.audit-time'], classifications: ['compatibility-only'] },
    review: 'Scheduler arguments are not part of the RxJS Next contract.',
  },
] as const satisfies readonly CapabilityMapping[];

export const defaultTestSchedulerCapabilities: readonly CapabilityMapping[] = Object.freeze(
  [...exactMappings, ...unifiedMappings].map((mapping) =>
    Object.freeze({
      ...mapping,
      arity: Object.freeze({ ...mapping.arity }),
      preconditions: Object.freeze([...mapping.preconditions]),
      evidence: Object.freeze({
        fixtureIds: Object.freeze([...mapping.evidence.fixtureIds]),
        classifications: Object.freeze([...mapping.evidence.classifications]),
      }),
    })
  )
);

export const defaultCapabilityRegistry: CapabilityRegistry = Object.freeze({
  schemaVersion: capabilityRegistrySchemaVersion,
  registryVersion: capabilityRegistryVersion,
  engineVersion: migrationEngineVersion,
  capabilities: defaultTestSchedulerCapabilities,
});
