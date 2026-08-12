import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { copyFile, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const DEFAULT_RXJS_VERSION = '7.8.2';
export const CACHE_SCHEMA_VERSION = 1;
export const TOOL_VERSIONS = Object.freeze({
  webpack: '5.106.2',
  webpackBundleAnalyzer: '4.10.2',
  tsLoader: '9.5.4',
  typescript: '5.7.3',
});

export const BUNDLE_CONFIGURATION = Object.freeze({
  mode: 'production',
  target: ['web', 'es2015'],
  conditionNames: ['es2015', 'browser', 'import', 'default'],
  mainFields: ['es2015', 'browser', 'module', 'main'],
  minimize: true,
  splitChunks: false,
  runtimeChunk: false,
  moduleIds: 'named-with-target-prefix',
  chunkIds: 'named',
  typescriptTarget: 'ES2015',
  typescriptSourceMap: false,
  typescriptInlineSources: false,
  statsModuleGrouping: false,
});

const EXACT_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const DIST_TAG_PATTERN = /^[A-Za-z][0-9A-Za-z._-]*$/;
const NEXT_NATIVE_LABEL = 'rxjs-next-native';
const NEXT_POLYFILL_LABEL = 'rxjs-next-polyfill';

export function usage() {
  return `Usage: pnpm run analyze:bundles -- [options]

Build the current RxJS Next source and compare it with published RxJS versions
in one static webpack-bundle-analyzer report.

Options:
  --rxjs-version <version-or-tag>  Published RxJS version or npm tag to include.
                                   Repeat to compare multiple versions. Supplying
                                   this option replaces the ${DEFAULT_RXJS_VERSION} default.
  --refresh                        Rebuild requested published-version caches.
  --no-open                        Write the report without opening a browser.
  --help                           Show this help.

Examples:
  pnpm run analyze:bundles
  pnpm run analyze:bundles -- --rxjs-version 7.8.1 --rxjs-version next
  pnpm run analyze:bundles -- --refresh --no-open

Published bundles and module maps are cached under
.cache/rxjs-bundle-analysis/. Current workspace bundles are always rebuilt.
Exact cached versions can be reused offline; npm tags are resolved on every run.
Initial or refreshed published builds and a missing disposable toolchain require
registry access. Reports, combined stats, and bundles are written under
dist/bundle-analysis/.`;
}

export function isExactVersion(value) {
  return EXACT_VERSION_PATTERN.test(value);
}

export function validateRxjsVersionRequest(value) {
  if (!value || (!isExactVersion(value) && !DIST_TAG_PATTERN.test(value))) {
    throw new Error(`Invalid RxJS version or tag "${value}". Use an exact version such as 7.8.2 or an npm tag such as next.`);
  }
  return value;
}

export function parseArgs(argv) {
  const requestedVersions = [];
  let refresh = false;
  let openReport = true;
  let help = false;

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];

    if (argument === '--') {
      continue;
    }
    if (argument === '--refresh') {
      refresh = true;
      continue;
    }
    if (argument === '--no-open') {
      openReport = false;
      continue;
    }
    if (argument === '--help' || argument === '-h') {
      help = true;
      continue;
    }
    if (argument === '--rxjs-version') {
      const value = argv[++index];
      if (value === undefined) {
        throw new Error('--rxjs-version requires a version or npm tag.');
      }
      requestedVersions.push(validateRxjsVersionRequest(value));
      continue;
    }
    if (argument.startsWith('--rxjs-version=')) {
      requestedVersions.push(validateRxjsVersionRequest(argument.slice('--rxjs-version='.length)));
      continue;
    }

    throw new Error(`Unknown option "${argument}".\n\n${usage()}`);
  }

  return {
    help,
    openReport,
    refresh,
    requestedVersions: [...new Set(requestedVersions.length > 0 ? requestedVersions : [DEFAULT_RXJS_VERSION])],
  };
}

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function createConfigurationFingerprint(toolVersions = TOOL_VERSIONS, bundleConfiguration = BUNDLE_CONFIGURATION) {
  return createHash('sha256')
    .update(
      stableJson({
        bundleConfiguration,
        cacheSchemaVersion: CACHE_SCHEMA_VERSION,
        toolVersions,
      })
    )
    .digest('hex')
    .slice(0, 16);
}

export function publishedArtifactLabel(version) {
  return `rxjs-${version.replace(/[^0-9A-Za-z._-]+/g, '-')}`;
}

export function publishedCacheDirectory(cacheRoot, version, fingerprint) {
  if (!isExactVersion(version)) {
    throw new Error(`Cannot create a published cache path for invalid version "${version}".`);
  }
  return path.join(cacheRoot, 'published', 'rxjs', version, fingerprint);
}

export async function discoverNextSourceFiles(sourceDirectory) {
  const entries = await readdir(sourceDirectory, { withFileTypes: true });
  const files = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith('.ts') &&
        !entry.name.endsWith('.spec.ts') &&
        !entry.name.endsWith('.d.ts') &&
        entry.name !== 'index.ts'
    )
    .map((entry) => path.join(sourceDirectory, entry.name))
    .sort((left, right) => left.localeCompare(right));

  if (files.length === 0) {
    throw new Error(`No RxJS Next runtime sources were found in ${sourceDirectory}.`);
  }

  return files;
}

function toImportSpecifier(filePath) {
  return filePath.split(path.sep).join('/');
}

export function createNextBarrelSource(sourceFiles) {
  return [
    "import '@rxjs/observable-polyfill';",
    ...sourceFiles.map((filePath) => `export * from ${JSON.stringify(toImportSpecifier(filePath))};`),
    '',
  ].join('\n');
}

export function createNamespaceEntrySource(request) {
  return [
    `import * as rxjsBundleAnalysis from ${JSON.stringify(request)};`,
    'globalThis.__RXJS_BUNDLE_ANALYSIS__ = rxjsBundleAnalysis;',
    '',
  ].join('\n');
}

function prefixedRecord(target, source, prefix) {
  for (const [key, value] of Object.entries(source ?? {})) {
    target[`${prefix}:${key}`] = value;
  }
}

export function combineWebpackStats(compilations, webpackVersion = TOOL_VERSIONS.webpack) {
  const combined = {
    name: 'rxjs-bundle-analysis',
    version: webpackVersion,
    hash: createHash('sha256')
      .update(compilations.map(({ label, stats }) => `${label}:${stats.hash ?? ''}`).join('|'))
      .digest('hex'),
    time: 0,
    builtAt: Date.now(),
    publicPath: 'auto',
    assets: [],
    assetsByChunkName: {},
    chunks: [],
    modules: [],
    entrypoints: {},
    namedChunkGroups: {},
    errors: [],
    warnings: [],
  };

  for (const { label, stats: child } of compilations) {
    combined.time += child.time ?? 0;
    combined.assets.push(...(child.assets ?? []));
    combined.chunks.push(...(child.chunks ?? []));
    combined.modules.push(...(child.modules ?? []));
    combined.errors.push(...(child.errors ?? []));
    combined.warnings.push(...(child.warnings ?? []));
    prefixedRecord(combined.assetsByChunkName, child.assetsByChunkName, label);
    prefixedRecord(combined.entrypoints, child.entrypoints, label);
    prefixedRecord(combined.namedChunkGroups, child.namedChunkGroups, label);
  }

  return combined;
}

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function sha256File(filePath) {
  const contents = await readFile(filePath);
  return createHash('sha256').update(contents).digest('hex');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function runCommand(command, args, { cwd, capture = false, description } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        NO_COLOR: '1',
      },
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });

    let stdout = '';
    let stderr = '';
    if (capture) {
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        stdout += chunk;
      });
      child.stderr.on('data', (chunk) => {
        stderr += chunk;
      });
    }

    child.on('error', (error) => {
      reject(new Error(`${description ?? command} could not start: ${error.message}`, { cause: error }));
    });
    child.on('close', (code, signal) => {
      if (code === 0) {
        resolve({ stderr, stdout });
        return;
      }

      const detail = capture ? `\n${stderr || stdout}` : '';
      reject(new Error(`${description ?? command} failed${signal ? ` with signal ${signal}` : ` with exit code ${code}`}.${detail}`));
    });
  });
}

function pnpmCommand() {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

async function resolveRegistryRequest(request, repositoryRoot) {
  process.stdout.write(`Resolving published RxJS ${request}...\n`);
  const { stdout } = await runCommand(pnpmCommand(), ['view', `rxjs@${request}`, '--json'], {
    capture: true,
    cwd: repositoryRoot,
    description: `Registry lookup for rxjs@${request}`,
  });

  let manifest;
  try {
    manifest = JSON.parse(stdout);
  } catch (error) {
    throw new Error(
      `Registry lookup for rxjs@${request} did not return valid JSON. Run once with registry access or use an already cached exact version.`,
      { cause: error }
    );
  }

  return normalizeRegistryManifest(request, manifest);
}

export function normalizeRegistryManifest(request, manifest) {
  const normalizedManifest = Array.isArray(manifest) ? manifest[0] : manifest;
  const version = normalizedManifest?.version;
  const integrity = normalizedManifest?.dist?.integrity;
  if (!isExactVersion(version) || typeof integrity !== 'string' || integrity.length === 0) {
    throw new Error(`Registry metadata for rxjs@${request} did not contain an exact version and integrity.`);
  }

  return { integrity, requested: request, version };
}

export async function readCachedPublishedTarget(cacheRoot, version, fingerprint, expectedIntegrity) {
  const cacheDirectory = publishedCacheDirectory(cacheRoot, version, fingerprint);
  const metadataPath = path.join(cacheDirectory, 'metadata.json');

  if (!(await pathExists(metadataPath))) {
    return null;
  }

  try {
    const metadata = await readJson(metadataPath);
    const bundlePath = path.join(cacheDirectory, metadata.bundleFile);
    const statsPath = path.join(cacheDirectory, metadata.statsFile);

    if (
      metadata.cacheSchemaVersion !== CACHE_SCHEMA_VERSION ||
      metadata.configurationFingerprint !== fingerprint ||
      metadata.resolvedVersion !== version ||
      (expectedIntegrity && metadata.integrity !== expectedIntegrity) ||
      !(await pathExists(bundlePath)) ||
      !(await pathExists(statsPath)) ||
      (await sha256File(bundlePath)) !== metadata.bundleSha256
    ) {
      return null;
    }

    return {
      bundlePath,
      cacheDirectory,
      label: metadata.label,
      metadata,
      stats: await readJson(statsPath),
    };
  } catch {
    return null;
  }
}

async function resolvePublishedTargets({ cacheRoot, fingerprint, refresh, repositoryRoot, requestedVersions }) {
  const resolved = [];

  for (const request of requestedVersions) {
    if (isExactVersion(request) && !refresh) {
      const cached = await readCachedPublishedTarget(cacheRoot, request, fingerprint);
      if (cached) {
        resolved.push({
          cached,
          integrity: cached.metadata.integrity,
          requested: request,
          version: request,
        });
        continue;
      }
    }

    const registryTarget = await resolveRegistryRequest(request, repositoryRoot);
    const cached = refresh
      ? null
      : await readCachedPublishedTarget(cacheRoot, registryTarget.version, fingerprint, registryTarget.integrity);
    resolved.push({ ...registryTarget, cached });
  }

  const uniqueByVersion = new Map();
  for (const target of resolved) {
    const existing = uniqueByVersion.get(target.version);
    if (!existing) {
      uniqueByVersion.set(target.version, target);
      continue;
    }

    if (existing.integrity !== target.integrity) {
      throw new Error(`Conflicting registry integrity values were returned for RxJS ${target.version}.`);
    }
    if (!existing.cached && target.cached) {
      uniqueByVersion.set(target.version, target);
    }
  }

  return [...uniqueByVersion.values()];
}

async function prepareToolEnvironment(toolDirectory, publishedTargets) {
  const dependencies = {
    'ts-loader': TOOL_VERSIONS.tsLoader,
    typescript: TOOL_VERSIONS.typescript,
    webpack: TOOL_VERSIONS.webpack,
    'webpack-bundle-analyzer': TOOL_VERSIONS.webpackBundleAnalyzer,
  };
  const aliases = new Map();

  publishedTargets
    .filter((target) => !target.cached)
    .forEach((target, index) => {
      const alias = `rxjs-bundle-published-${index}`;
      aliases.set(target.version, alias);
      dependencies[alias] = `npm:rxjs@${target.version}`;
    });

  await writeJson(path.join(toolDirectory, 'package.json'), {
    name: 'rxjs-bundle-analysis-toolchain',
    private: true,
    version: '0.0.0',
    packageManager: 'pnpm@10.34.5',
    dependencies,
  });

  process.stdout.write('Preparing the isolated bundle-analysis toolchain...\n');
  await runCommand(pnpmCommand(), ['--dir', toolDirectory, 'install', '--ignore-scripts', '--prefer-offline', '--reporter=append-only'], {
    cwd: toolDirectory,
    description: 'Isolated bundle-analysis toolchain installation',
  });

  return aliases;
}

class TargetPrefixedModuleIdsPlugin {
  constructor(prefix) {
    this.prefix = prefix;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('TargetPrefixedModuleIdsPlugin', (compilation) => {
      compilation.hooks.afterOptimizeModuleIds.tap('TargetPrefixedModuleIdsPlugin', (modules) => {
        for (const module of modules) {
          const id = compilation.chunkGraph.getModuleId(module);
          if (id !== null && id !== undefined && !String(id).startsWith(`${this.prefix}:`)) {
            compilation.chunkGraph.setModuleId(module, `${this.prefix}:${id}`);
          }
        }
      });
    });
  }
}

async function compileWebpackTarget({ entryFile, label, outputDirectory, polyfillAlias, repositoryRoot, toolRequire }) {
  const webpack = toolRequire('webpack');
  const tsLoader = toolRequire.resolve('ts-loader');
  const assetName = `${label}.js`;

  const config = {
    name: label,
    context: repositoryRoot,
    mode: BUNDLE_CONFIGURATION.mode,
    target: BUNDLE_CONFIGURATION.target,
    entry: {
      [label]: entryFile,
    },
    output: {
      path: outputDirectory,
      filename: assetName,
      clean: false,
      iife: true,
      uniqueName: label,
    },
    cache: false,
    devtool: false,
    performance: false,
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: tsLoader,
            options: {
              transpileOnly: true,
              onlyCompileBundledFiles: true,
              compilerOptions: {
                module: 'ESNext',
                moduleResolution: 'Bundler',
                target: BUNDLE_CONFIGURATION.typescriptTarget,
                sourceMap: BUNDLE_CONFIGURATION.typescriptSourceMap,
                inlineSources: BUNDLE_CONFIGURATION.typescriptInlineSources,
              },
            },
          },
        },
      ],
    },
    optimization: {
      minimize: BUNDLE_CONFIGURATION.minimize,
      splitChunks: BUNDLE_CONFIGURATION.splitChunks,
      runtimeChunk: BUNDLE_CONFIGURATION.runtimeChunk,
      moduleIds: 'named',
      chunkIds: BUNDLE_CONFIGURATION.chunkIds,
    },
    plugins: [new TargetPrefixedModuleIdsPlugin(label)],
    resolve: {
      alias:
        polyfillAlias === undefined
          ? {}
          : {
              '@rxjs/observable-polyfill$': polyfillAlias,
            },
      conditionNames: BUNDLE_CONFIGURATION.conditionNames,
      mainFields: BUNDLE_CONFIGURATION.mainFields,
      extensions: ['.ts', '.mjs', '.js', '.json'],
      extensionAlias: {
        '.js': ['.ts', '.js'],
      },
    },
    stats: 'errors-warnings',
  };

  const compiler = webpack(config);
  const stats = await new Promise((resolve, reject) => {
    compiler.run((error, result) => {
      compiler.close((closeError) => {
        if (error || closeError) {
          reject(error ?? closeError);
          return;
        }
        if (!result) {
          reject(new Error(`Webpack returned no stats for ${label}.`));
          return;
        }
        if (result.hasErrors()) {
          reject(
            new Error(
              `Webpack failed for ${label}:\n${result.toString({
                all: false,
                errors: true,
                errorDetails: true,
              })}`
            )
          );
          return;
        }
        resolve(
          result.toJson({
            all: true,
            groupModulesByExtension: BUNDLE_CONFIGURATION.statsModuleGrouping,
            groupModulesByPath: BUNDLE_CONFIGURATION.statsModuleGrouping,
            groupModulesByType: BUNDLE_CONFIGURATION.statsModuleGrouping,
          })
        );
      });
    });
  });

  return {
    assetName,
    bundlePath: path.join(outputDirectory, assetName),
    label,
    stats,
  };
}

async function buildPublishedTarget({ alias, cacheRoot, entriesDirectory, fingerprint, repositoryRoot, target, toolRequire }) {
  const label = publishedArtifactLabel(target.version);
  const cacheDirectory = publishedCacheDirectory(cacheRoot, target.version, fingerprint);
  const cacheParent = path.dirname(cacheDirectory);
  const stagingDirectory = path.join(cacheParent, `${path.basename(cacheDirectory)}.tmp-${process.pid}-${Date.now()}`);
  const entryFile = path.join(entriesDirectory, `${label}.mjs`);

  await mkdir(cacheParent, { recursive: true });
  await mkdir(stagingDirectory, { recursive: true });
  await writeFile(entryFile, createNamespaceEntrySource(alias));

  try {
    process.stdout.write(`Bundling published RxJS ${target.version}...\n`);
    const compilation = await compileWebpackTarget({
      entryFile,
      label,
      outputDirectory: stagingDirectory,
      repositoryRoot,
      toolRequire,
    });
    const statsFile = 'stats.json';
    await writeJson(path.join(stagingDirectory, statsFile), compilation.stats);
    const metadata = {
      cacheSchemaVersion: CACHE_SCHEMA_VERSION,
      configurationFingerprint: fingerprint,
      generatedAt: new Date().toISOString(),
      requested: target.requested,
      resolvedVersion: target.version,
      integrity: target.integrity,
      label,
      bundleFile: compilation.assetName,
      bundleSha256: await sha256File(compilation.bundlePath),
      statsFile,
      toolVersions: TOOL_VERSIONS,
      bundleConfiguration: BUNDLE_CONFIGURATION,
    };
    await writeJson(path.join(stagingDirectory, 'metadata.json'), metadata);

    await rm(cacheDirectory, { recursive: true, force: true });
    await rename(stagingDirectory, cacheDirectory);
  } catch (error) {
    await rm(stagingDirectory, { recursive: true, force: true });
    throw error;
  }

  const cached = await readCachedPublishedTarget(cacheRoot, target.version, fingerprint, target.integrity);
  if (!cached) {
    throw new Error(`The freshly generated cache for RxJS ${target.version} failed validation.`);
  }
  return cached;
}

async function copyPublishedArtifact(cached, outputDirectory) {
  const destination = path.join(outputDirectory, path.basename(cached.bundlePath));
  await copyFile(cached.bundlePath, destination);
}

function analyzerBinary(toolRequire) {
  const packageJsonPath = toolRequire.resolve('webpack-bundle-analyzer/package.json');
  const manifest = JSON.parse(toolRequire('node:fs').readFileSync(packageJsonPath, 'utf8'));
  const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin['webpack-bundle-analyzer'];
  if (!bin) {
    throw new Error('The pinned webpack-bundle-analyzer package does not expose its expected CLI.');
  }
  return path.resolve(path.dirname(packageJsonPath), bin);
}

async function generateAnalyzerReport({ combinedStatsPath, openReport, outputDirectory, reportPath, toolRequire }) {
  const args = [
    analyzerBinary(toolRequire),
    combinedStatsPath,
    outputDirectory,
    '--mode',
    'static',
    '--report',
    reportPath,
    '--title',
    'RxJS bundle comparison',
    '--default-sizes',
    'gzip',
  ];
  if (!openReport) {
    args.push('--no-open');
  }

  await runCommand(process.execPath, args, {
    cwd: outputDirectory,
    description: 'webpack-bundle-analyzer report generation',
  });
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const rxjsSourceDirectory = path.join(repositoryRoot, 'packages', 'rxjs', 'src');
  const polyfillSource = path.join(repositoryRoot, 'packages', 'observable-polyfill', 'src', 'index.ts');
  const cacheRoot = path.join(repositoryRoot, '.cache', 'rxjs-bundle-analysis');
  const outputDirectory = path.join(repositoryRoot, 'dist', 'bundle-analysis');
  const reportPath = path.join(outputDirectory, 'report.html');
  const combinedStatsPath = path.join(outputDirectory, 'stats.json');
  const fingerprint = createConfigurationFingerprint();
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'rxjs-bundle-analysis-'));
  const entriesDirectory = path.join(temporaryRoot, 'entries');

  try {
    await mkdir(entriesDirectory, { recursive: true });
    await rm(outputDirectory, { recursive: true, force: true });
    await mkdir(outputDirectory, { recursive: true });

    const publishedTargets = await resolvePublishedTargets({
      cacheRoot,
      fingerprint,
      refresh: options.refresh,
      repositoryRoot,
      requestedVersions: options.requestedVersions,
    });
    const aliases = await prepareToolEnvironment(temporaryRoot, publishedTargets);
    const toolRequire = createRequire(path.join(temporaryRoot, 'package.json'));

    const sourceFiles = await discoverNextSourceFiles(rxjsSourceDirectory);
    const nextBarrel = path.join(entriesDirectory, 'rxjs-next-barrel.mjs');
    const nextEntry = path.join(entriesDirectory, 'rxjs-next-entry.mjs');
    await writeFile(nextBarrel, createNextBarrelSource(sourceFiles));
    await writeFile(nextEntry, createNamespaceEntrySource('./rxjs-next-barrel.mjs'));

    process.stdout.write(`Bundling ${sourceFiles.length} RxJS Next runtime modules for a native Observable...\n`);
    const nextNative = await compileWebpackTarget({
      entryFile: nextEntry,
      label: NEXT_NATIVE_LABEL,
      outputDirectory,
      polyfillAlias: false,
      repositoryRoot,
      toolRequire,
    });

    process.stdout.write(`Bundling ${sourceFiles.length} RxJS Next runtime modules with the fallback...\n`);
    const nextPolyfill = await compileWebpackTarget({
      entryFile: nextEntry,
      label: NEXT_POLYFILL_LABEL,
      outputDirectory,
      polyfillAlias: polyfillSource,
      repositoryRoot,
      toolRequire,
    });

    const publishedCompilations = [];
    for (const target of publishedTargets) {
      let cached = target.cached;
      if (cached) {
        process.stdout.write(`Reusing cached published RxJS ${target.version} bundle map.\n`);
      } else {
        cached = await buildPublishedTarget({
          alias: aliases.get(target.version),
          cacheRoot,
          entriesDirectory,
          fingerprint,
          repositoryRoot,
          target,
          toolRequire,
        });
      }
      await copyPublishedArtifact(cached, outputDirectory);
      publishedCompilations.push({ label: cached.label, stats: cached.stats });
    }

    const combinedStats = combineWebpackStats(
      [
        { label: nextNative.label, stats: nextNative.stats },
        { label: nextPolyfill.label, stats: nextPolyfill.stats },
        ...publishedCompilations,
      ],
      toolRequire('webpack').version
    );
    await writeJson(combinedStatsPath, combinedStats);
    await generateAnalyzerReport({
      combinedStatsPath,
      openReport: options.openReport,
      outputDirectory,
      reportPath,
      toolRequire,
    });

    process.stdout.write(`Bundle analysis complete: ${reportPath}\n`);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

const invokedAsScript = process.argv[1] !== undefined && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (invokedAsScript) {
  main().catch((error) => {
    process.stderr.write(`Bundle analysis failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
