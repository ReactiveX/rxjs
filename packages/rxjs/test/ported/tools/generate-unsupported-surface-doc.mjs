#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(toolDirectory, '../../../../..');
const catalogPath = resolve(toolDirectory, '../unsupported-surface-catalog.json');
const manifestPath = resolve(toolDirectory, '../manifest.generated.json');
const capabilityRegistryPath = resolve(toolDirectory, '../capability-registry.json');
const markdownPath = resolve(repositoryRoot, 'packages/rxjs/docs/UNSUPPORTED_RXJS_7_SURFACES.md');
const checkOnly = process.argv.includes('--check');

const [catalog, manifest, capabilityRegistry] = await Promise.all(
  [catalogPath, manifestPath, capabilityRegistryPath].map((path) => readFile(path, 'utf8').then(JSON.parse))
);

validateCatalog(catalog, manifest, capabilityRegistry);

const markdown = await prettier.format(renderMarkdown(catalog), { parser: 'markdown' });

if (checkOnly) {
  const current = await readFile(markdownPath, 'utf8').catch(() => '');
  if (current !== markdown) {
    throw new Error('Unsupported RxJS 7 surface documentation is stale. Run test:unit:unsupported:generate.');
  }
  process.stdout.write('Unsupported RxJS 7 surface catalog and documentation are current.\n');
} else {
  await writeFile(markdownPath, markdown, 'utf8');
  process.stdout.write(`Generated ${markdownPath}\n`);
}

function validateCatalog(value, sourceManifest, registry) {
  const expectedCategories = ['imports', 'types', 'schedulers', 'interop', 'deprecatedAliases'];
  const dispositions = new Set(['replace', 'manual-review', 'unsupported', 'test-only', 'removed']);
  const errors = [];

  if (value.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (value.source?.ref !== sourceManifest.sourceRef || value.source?.commit !== sourceManifest.sourceCommit) {
    errors.push('source ref and commit must match the generated port manifest');
  }

  const actualCategories = Object.keys(value.categories ?? {});
  if (actualCategories.join(',') !== expectedCategories.join(',')) {
    errors.push(`categories must be ordered exactly as: ${expectedCategories.join(', ')}`);
  }

  const ids = new Set();
  const categorySurfaces = new Map();
  for (const category of expectedCategories) {
    const entries = value.categories?.[category];
    if (!Array.isArray(entries) || entries.length === 0) {
      errors.push(`${category} must contain at least one entry`);
      continue;
    }

    const surfaces = new Set();
    categorySurfaces.set(category, surfaces);
    for (const entry of entries) {
      if (typeof entry.id !== 'string' || !entry.id.startsWith(`${category === 'deprecatedAliases' ? 'aliases' : category}:`)) {
        errors.push(`${category} entry has an invalid id: ${entry.id}`);
      } else if (ids.has(entry.id)) {
        errors.push(`duplicate id: ${entry.id}`);
      } else {
        ids.add(entry.id);
      }

      if (!Array.isArray(entry.surfaces) || entry.surfaces.length === 0 || entry.surfaces.some((surface) => typeof surface !== 'string')) {
        errors.push(`${entry.id} must list one or more string surfaces`);
      } else {
        for (const surface of entry.surfaces) {
          if (surfaces.has(surface)) errors.push(`${category} repeats surface: ${surface}`);
          surfaces.add(surface);
        }
      }

      if (!dispositions.has(entry.disposition)) errors.push(`${entry.id} has invalid disposition: ${entry.disposition}`);
      for (const field of ['replacement', 'rationale']) {
        if (typeof entry[field] !== 'string' || entry[field].trim() === '') errors.push(`${entry.id} requires ${field}`);
      }
      if (
        !Array.isArray(entry.decisions) ||
        entry.decisions.length === 0 ||
        entry.decisions.some((decision) => !/^D-\d{3}$/.test(decision))
      ) {
        errors.push(`${entry.id} requires one or more decision ids`);
      }
    }
  }

  requireSurfaces(
    categorySurfaces,
    'imports',
    ['rxjs/operators', 'rxjs/testing', 'rxjs/internal/*', 'bindCallback', 'bindNodeCallback', 'scheduled', 'using', 'isObservable'],
    errors
  );
  requireSurfaces(categorySurfaces, 'types', ['Subscription', 'ObservableInput', 'OperatorFunction', 'SchedulerLike'], errors);
  requireSurfaces(
    categorySurfaces,
    'interop',
    ['Symbol.observable', 'objects with subscribe()', 'foreign-realm Observable', 'Observable.lift'],
    errors
  );
  requireSurfaces(
    categorySurfaces,
    'deprecatedAliases',
    ['combineAll', 'flatMap', 'pipeable partition', 'empty()', 'never()', 'mapTo', 'new BehaviorSubject(value)'],
    errors
  );

  const schedulerSurfaces = categorySurfaces.get('schedulers') ?? new Set();
  const schedulerCapabilities = [...Object.entries(registry.operators), ...Object.entries(registry.staticFactories)]
    .filter(([, capability]) =>
      /schedul|host tim|timestamp provider|clock provider/i.test(`${capability.status ?? ''} ${capability.note ?? ''}`)
    )
    .map(([name]) => name);
  for (const name of [...schedulerCapabilities, 'scheduled']) {
    if (!schedulerSurfaces.has(name)) errors.push(`schedulers must classify legacy scheduler surface: ${name}`);
  }

  if (errors.length > 0) {
    throw new Error(`Invalid unsupported RxJS 7 surface catalog:\n- ${errors.join('\n- ')}`);
  }
}

function requireSurfaces(categorySurfaces, category, required, errors) {
  const surfaces = categorySurfaces.get(category) ?? new Set();
  for (const surface of required) {
    if (!surfaces.has(surface)) errors.push(`${category} must classify required surface: ${surface}`);
  }
}

function renderMarkdown(value) {
  const headings = {
    imports: 'Imports and package paths',
    types: 'Types',
    schedulers: 'Schedulers and scheduler overloads',
    interop: 'Interop protocols',
    deprecatedAliases: 'Deprecated and removed aliases',
  };
  const entries = Object.values(value.categories).flat();
  const dispositionTotals = Object.fromEntries(
    [...new Set(entries.map(({ disposition }) => disposition))]
      .sort()
      .map((disposition) => [disposition, entries.filter((entry) => entry.disposition === disposition).length])
  );

  let output = `# Unsupported RxJS 7 surfaces\n\n`;
  output += `This generated catalog records RxJS 7 public imports and behavioral protocols that RxJS Next does not preserve as compatibility APIs. It is migration guidance, not an emulation commitment. The source inventory is pinned to RxJS 7 \`${value.source.ref}\` at \`${value.source.commit}\`.\n\n`;
  output += `Regenerate it with \`pnpm --filter rxjs run test:unit:unsupported:generate\`; the corresponding \`--check\` gate rejects a stale document, a source-pin mismatch, missing required categories, or unclassified scheduler-bearing capabilities.\n\n`;
  output += `## Summary\n\n`;
  output += `| Measure | Count |\n| --- | ---: |\n`;
  output += `| Catalog groups | ${entries.length} |\n`;
  output += `| Named surfaces | ${entries.reduce((total, entry) => total + entry.surfaces.length, 0)} |\n`;
  for (const [disposition, total] of Object.entries(dispositionTotals)) {
    output += `| ${label(disposition)} groups | ${total} |\n`;
  }
  output += `\n## Dispositions\n\n`;
  output += `- **Replace:** a supported Next or platform destination exists, but its imports, types, or lifecycle may differ.\n`;
  output += `- **Manual review:** no mechanical rewrite is safe without reviewing cancellation, sharing, timing, or ownership.\n`;
  output += `- **Unsupported:** no accepted Next compatibility contract exists.\n`;
  output += `- **Test only:** any adapter is limited to evidence infrastructure and must not become an application migration.\n`;
  output += `- **Removed:** the surface has no replacement and should disappear.\n\n`;

  for (const [category, categoryEntries] of Object.entries(value.categories)) {
    output += `## ${headings[category]}\n\n`;
    output += `| RxJS 7 surface | Disposition | Migration direction | Why | Decisions |\n`;
    output += `| --- | --- | --- | --- | --- |\n`;
    for (const entry of categoryEntries) {
      output += `| ${entry.surfaces.map(code).join('<br>')} | ${label(entry.disposition)} | ${escapeCell(entry.replacement)} | ${escapeCell(
        entry.rationale
      )} | ${entry.decisions.join(', ')} |\n`;
    }
    output += `\n`;
  }

  output += `## Review rule\n\n`;
  output += `A migration tool may automate only a cataloged **replace** mapping whose target capability and contract are also present in the migration evidence ledger. It must stop with a structured diagnostic for **manual review**, **unsupported**, **test only**, or **removed** entries. Adding a compatibility runtime, scheduler abstraction, import alias, interop protocol, or deep-import bridge requires a new accepted architecture decision.\n`;
  return output;
}

function code(value) {
  return `\`${value.replaceAll('|', '\\|').replaceAll('`', '\\`')}\``;
}

function escapeCell(value) {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function label(value) {
  return value
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}
