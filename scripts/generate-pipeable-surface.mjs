#!/usr/bin/env node

import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(repositoryRoot, 'packages/rxjs/src');
const generatedStart = '// BEGIN GENERATED FUNCTIONAL SURFACE';
const generatedEnd = '// END GENERATED FUNCTIONAL SURFACE';
const checkOnly = process.argv.includes('--check');

const customPipeables = new Set(['filter', 'map', 'take']);
const excludedCapabilities = new Set(['create']);
const staticFacadeExclusions = new Set(['create', 'pipe']);
const withNames = new Map([
  ['combine', 'combineWith'],
  ['combineLatest', 'combineLatestWith'],
  ['concat', 'concatWith'],
  ['merge', 'mergeWith'],
  ['onErrorResumeNext', 'onErrorResumeNextWith'],
  ['race', 'raceWith'],
]);
const sourceTypeParameters = new Map([['combineLatestAll', 'T extends ObservableInput<any>']]);

const pendingWrites = [];

function kebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function exported(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function findSymbolName(sourceFile) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement) || !exported(statement)) {
      continue;
    }
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.type?.getText(sourceFile).includes('unique symbol')) {
        return declaration.name.text;
      }
    }
  }
  return undefined;
}

function findInterfaceMember(sourceFile, interfaceName, symbolName) {
  let result;
  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      for (const member of node.members) {
        if (member.name?.getText(sourceFile) === `[${symbolName}]`) {
          result = member;
          return;
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function findNamedType(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if ((ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) && statement.name.text === name) {
      return statement;
    }
  }
  return undefined;
}

function applySubstitutions(text, substitutions, shadowedNames = new Set()) {
  let result = text;
  for (const [name, replacement] of substitutions) {
    if (!shadowedNames.has(name)) {
      result = result.replace(new RegExp(`\\b${name}\\b`, 'g'), replacement);
    }
  }
  return result;
}

function callSignaturesFromType(sourceFile, typeNode, substitutions = new Map()) {
  if (ts.isFunctionTypeNode(typeNode)) {
    return [{ node: typeNode, substitutions }];
  }
  if (ts.isTypeLiteralNode(typeNode)) {
    return typeNode.members.filter(ts.isCallSignatureDeclaration).map((node) => ({ node, substitutions }));
  }
  if (ts.isConditionalTypeNode(typeNode)) {
    return callSignaturesFromType(sourceFile, typeNode.trueType, substitutions);
  }
  if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
    const declaration = findNamedType(sourceFile, typeNode.typeName.text);
    const nextSubstitutions = new Map(substitutions);
    const declarationParameters = declaration?.typeParameters ?? [];
    const referenceArguments = typeNode.typeArguments ?? [];
    for (let index = 0; index < declarationParameters.length; index++) {
      const parameter = declarationParameters[index];
      const argument = referenceArguments[index];
      if (parameter && argument) {
        nextSubstitutions.set(parameter.name.text, applySubstitutions(argument.getText(sourceFile), substitutions));
      }
    }
    if (declaration && ts.isInterfaceDeclaration(declaration)) {
      return declaration.members.filter(ts.isCallSignatureDeclaration).map((node) => ({ node, substitutions: nextSubstitutions }));
    }
    if (declaration && ts.isTypeAliasDeclaration(declaration)) {
      return callSignaturesFromType(sourceFile, declaration.type, nextSubstitutions);
    }
  }
  throw new Error(`Unsupported callable declaration in ${sourceFile.fileName}: ${typeNode.getText(sourceFile)}`);
}

function callSignatures(sourceFile, member) {
  if (!member) {
    return [];
  }
  if (ts.isMethodSignature(member)) {
    return [{ node: member, substitutions: new Map() }];
  }
  if (ts.isPropertySignature(member) && member.type) {
    return callSignaturesFromType(sourceFile, member.type);
  }
  throw new Error(`Unsupported interface member in ${sourceFile.fileName}: ${member.getText(sourceFile)}`);
}

function signatureText(sourceFile, record, node) {
  const shadowedNames = new Set((record.node.typeParameters ?? []).map((parameter) => parameter.name.text));
  return applySubstitutions(node.getText(sourceFile), record.substitutions, shadowedNames);
}

function explicitThisParameter(record) {
  const first = record.node.parameters[0];
  return first?.name.getText() === 'this' ? first : undefined;
}

function sourceType(sourceFile, record) {
  const thisParameter = explicitThisParameter(record);
  if (!thisParameter?.type) {
    return 'Observable<T>';
  }
  return signatureText(sourceFile, record, thisParameter.type);
}

function typeParameters(sourceFile, record, symbolName, includeSourceType) {
  const signature = record.node;
  const thisType = sourceType(sourceFile, record);
  const callTypeNames = new Set((signature.typeParameters ?? []).map((parameter) => parameter.name.text));
  const needsSourceType = includeSourceType && !callTypeNames.has('T') && /\bT\b/.test(thisType);
  const sourceParameter = sourceTypeParameters.get(symbolName) ?? 'T';
  const parameters = needsSourceType ? [sourceParameter] : [];
  for (const parameter of signature.typeParameters ?? []) {
    const text = signatureText(sourceFile, record, parameter);
    const name = parameter.name.text;
    if (needsSourceType && name === 'T') {
      throw new Error(`Unexpected shadowed source type T in ${sourceFile.fileName}: ${signature.getText(sourceFile)}`);
    }
    parameters.push(text);
  }
  return parameters.length > 0 ? `<${parameters.join(', ')}>` : '';
}

function signatureParameters(sourceFile, record) {
  return record.node.parameters
    .filter((parameter) => parameter !== explicitThisParameter(record))
    .map((parameter) => signatureText(sourceFile, record, parameter))
    .join(', ');
}

function returnType(sourceFile, record) {
  if (!record.node.type) {
    throw new Error(`Missing return type in ${sourceFile.fileName}: ${record.node.getText(sourceFile)}`);
  }
  return signatureText(sourceFile, record, record.node.type);
}

function generatedDocumentation(publicName, symbolName, resultKind) {
  const terminalText =
    resultKind === 'async-generator'
      ? 'The AsyncGenerator result is returned unchanged, preserving the selected AsyncIterable strategy.'
      : resultKind === 'arbitrary'
        ? 'Any non-Observable result is returned unchanged.'
        : 'The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.';
  return `/**
 * Creates the pipeable \`${publicName}\` form of the exact-Symbol \`[${symbolName}]\` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * \`rx\`, \`pipe\`, or another function-composition helper. ${terminalText}
 *
 * @returns A unary function that applies \`[${symbolName}]\` to its source.
 */`;
}

function generatedPipeableBlock(sourceFile, symbolName, publicName, signatures) {
  const internalName = `pipeable${symbolName[0].toUpperCase()}${symbolName.slice(1)}`;
  const results = signatures.map((signature) => returnType(sourceFile, signature));
  const resultKind = results.some((result) => result.startsWith('AsyncGenerator<'))
    ? 'async-generator'
    : results.some((result) => !result.startsWith('Observable<'))
      ? 'arbitrary'
      : 'observable';
  const overloads = signatures.map((record) => {
    const generics = typeParameters(sourceFile, record, symbolName, true);
    const parameters = signatureParameters(sourceFile, record);
    const result = returnType(sourceFile, record);
    return `export function ${internalName}${generics}(${parameters}): (source: ${sourceType(sourceFile, record)}) => ${result};`;
  });
  return `${generatedDocumentation(publicName, symbolName, resultKind)}
${overloads.join('\n')}
export function ${internalName}(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[${symbolName}] as (...values: any[]) => any, source, args);
}`;
}

function generatedStaticBlock(sourceFile, symbolName, signatures) {
  const internalName = `static${symbolName[0].toUpperCase()}${symbolName.slice(1)}`;
  const overloads = signatures.map((record) => {
    const generics = typeParameters(sourceFile, record, symbolName, false);
    const parameters = signatureParameters(sourceFile, record);
    const result = returnType(sourceFile, record);
    return `export function ${internalName}${generics}(${parameters}): ${result};`;
  });
  return `/**
 * Calls the static exact-Symbol \`Observable[${symbolName}]\` capability as an ordinary function.
 *
 * Construction, conversion, error forwarding, and cancellation remain owned
 * by the installed Symbol implementation.
 */
${overloads.join('\n')}
export function ${internalName}(...args: any[]): any {
  return Reflect.apply(Observable[${symbolName}] as (...values: any[]) => any, Observable, args);
}`;
}

function removeGeneratedBlock(text) {
  const start = text.indexOf(generatedStart);
  if (start < 0) {
    return text.trimEnd();
  }
  const end = text.indexOf(generatedEnd, start);
  if (end < 0) {
    throw new Error('Generated functional-surface block has no end marker');
  }
  return `${text.slice(0, start).trimEnd()}${text.slice(end + generatedEnd.length)}`.trimEnd();
}

function extraExports(sourceFile, symbolName) {
  const values = [];
  const types = [];
  for (const statement of sourceFile.statements) {
    if (!exported(statement)) {
      continue;
    }
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
      types.push(statement.name.text);
      continue;
    }
    if (ts.isClassDeclaration(statement) && statement.name) {
      values.push(statement.name.text);
      continue;
    }
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      statement.name.text !== symbolName &&
      !/^(?:pipeable|static)[A-Z]/.test(statement.name.text)
    ) {
      values.push(statement.name.text);
      continue;
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.name.text !== symbolName) {
          values.push(declaration.name.text);
        }
      }
    }
  }
  return { values, types };
}

function aliasModule({ sourceBase, valueExport, sourceExport, extras }) {
  const valueNames = [sourceExport, ...extras.values];
  const valueClause = sourceExport === valueExport
    ? valueNames.join(', ')
    : `${sourceExport} as ${valueExport}${extras.values.length > 0 ? `, ${extras.values.join(', ')}` : ''}`;
  const lines = [`export { ${valueClause} } from '../${sourceBase}.js';`];
  if (extras.types.length > 0) {
    lines.push(`export type { ${extras.types.join(', ')} } from '../${sourceBase}.js';`);
  }
  return `${lines.join('\n')}\n`;
}

async function queueWrite(path, content) {
  let existing;
  try {
    existing = await readFile(path, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  if (existing !== content) {
    pendingWrites.push({ path, content });
  }
}

async function main() {
  const entries = await readdir(sourceRoot);
  const catalog = [];

  for (const entry of entries.sort()) {
    if (!entry.endsWith('.ts') || entry.endsWith('.spec.ts')) {
      continue;
    }
    const path = join(sourceRoot, entry);
    const original = await readFile(path, 'utf8');
    const sourceFile = ts.createSourceFile(path, original, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const symbolName = findSymbolName(sourceFile);
    if (!symbolName) {
      continue;
    }

    const sourceBase = entry.slice(0, -3);
    const instanceMember = findInterfaceMember(sourceFile, 'Observable', symbolName);
    const staticMember = findInterfaceMember(sourceFile, 'ObservableCtor', symbolName);
    const instanceSignatures = callSignatures(sourceFile, instanceMember);
    const staticSignatures = callSignatures(sourceFile, staticMember);
    const publicOperatorName = withNames.get(symbolName) ?? symbolName;
    const extras = extraExports(sourceFile, symbolName);
    const excluded = excludedCapabilities.has(symbolName);
    const custom = customPipeables.has(symbolName);

    catalog.push({
      entry,
      sourceBase,
      symbolName,
      publicOperatorName,
      instance: instanceSignatures.length > 0 && !excluded,
      static: staticSignatures.length > 0 && !staticFacadeExclusions.has(symbolName),
      custom,
      extras,
    });

    const blocks = [];
    if (instanceSignatures.length > 0 && !excluded && !custom) {
      blocks.push(generatedPipeableBlock(sourceFile, symbolName, publicOperatorName, instanceSignatures));
    }
    if (staticSignatures.length > 0 && !staticFacadeExclusions.has(symbolName)) {
      blocks.push(generatedStaticBlock(sourceFile, symbolName, staticSignatures));
    }

    const base = removeGeneratedBlock(original);
    const next = blocks.length > 0
      ? `${base}\n\n${generatedStart}\n\n${blocks.join('\n\n')}\n\n${generatedEnd}\n`
      : `${base}\n`;
    await queueWrite(path, next);
  }

  for (const item of catalog) {
    const symbolAlias = aliasModule({
      sourceBase: item.sourceBase,
      valueExport: item.symbolName,
      sourceExport: item.symbolName,
      extras: item.extras,
    });
    await queueWrite(join(sourceRoot, 'symbol', item.entry), symbolAlias);

    if (item.instance && !item.custom) {
      const internalName = `pipeable${item.symbolName[0].toUpperCase()}${item.symbolName.slice(1)}`;
      const pipeableAlias = aliasModule({
        sourceBase: item.sourceBase,
        valueExport: item.publicOperatorName,
        sourceExport: internalName,
        extras: item.extras,
      });
      await queueWrite(join(sourceRoot, 'pipeable', `${kebabCase(item.publicOperatorName)}.ts`), pipeableAlias);
    }

    if (item.static) {
      const internalName = `static${item.symbolName[0].toUpperCase()}${item.symbolName.slice(1)}`;
      const staticAlias = aliasModule({
        sourceBase: item.sourceBase,
        valueExport: item.symbolName,
        sourceExport: internalName,
        extras: item.extras,
      });
      await queueWrite(join(sourceRoot, 'static', item.entry), staticAlias);
    }
  }

  const symbolBarrel = catalog
    .map((item) => `export { ${item.symbolName} } from './${item.sourceBase}.js';`)
    .join('\n');
  await queueWrite(join(sourceRoot, 'symbol', 'index.ts'), `${symbolBarrel}\n`);

  const pipeableBarrelLines = [
    "export { filter } from './filter.js';",
    "export { map } from './map.js';",
    "export { subscribe, type Subscription } from './subscribe.js';",
    "export { take } from './take.js';",
    "export { toArray } from './to-array.js';",
    "export type { OperatorFunction, UnaryFunction } from './types.js';",
  ];
  for (const item of catalog) {
    if (item.instance && !item.custom) {
      pipeableBarrelLines.push(
        `export { ${item.publicOperatorName} } from './${kebabCase(item.publicOperatorName)}.js';`
      );
    }
  }
  await queueWrite(join(sourceRoot, 'pipeable', 'index.ts'), `${pipeableBarrelLines.join('\n')}\n`);

  const staticBarrel = catalog
    .filter((item) => item.static)
    .map((item) => `export { ${item.symbolName} } from './${item.sourceBase}.js';`)
    .join('\n');
  await queueWrite(join(sourceRoot, 'static', 'index.ts'), `${staticBarrel}\n`);

  const rootLines = [];
  for (const item of catalog) {
    if (item.instance && !item.custom) {
      rootLines.push(`export { ${item.publicOperatorName} } from './pipeable/${kebabCase(item.publicOperatorName)}.js';`);
    }
    if (item.static) {
      rootLines.push(`export { ${item.symbolName} } from './static/${item.sourceBase}.js';`);
    }
    if (item.extras.values.length > 0) {
      rootLines.push(`export { ${item.extras.values.join(', ')} } from './${item.sourceBase}.js';`);
    }
    if (item.extras.types.length > 0) {
      rootLines.push(`export type { ${item.extras.types.join(', ')} } from './${item.sourceBase}.js';`);
    }
  }

  const indexPath = join(sourceRoot, 'index.ts');
  const indexOriginal = await readFile(indexPath, 'utf8');
  const indexBase = removeGeneratedBlock(indexOriginal);
  const nextIndex = `${indexBase}\n\n${generatedStart}\n\n${rootLines.join('\n')}\n\n${generatedEnd}\n`;
  await queueWrite(indexPath, nextIndex);

  const inventory = {
    pipeableOperators: catalog.filter((item) => item.instance).map((item) => item.publicOperatorName),
    staticFunctions: catalog.filter((item) => item.static).map((item) => item.symbolName),
    symbols: catalog.map((item) => item.symbolName),
  };
  await queueWrite(join(sourceRoot, 'pipeable', 'catalog.json'), `${JSON.stringify(inventory, null, 2)}\n`);

  const packagePath = join(repositoryRoot, 'packages/rxjs/package.json');
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
  const sourceExports = packageJson.tshy.exports;
  sourceExports['./pipeable'] = './src/pipeable/index.ts';
  sourceExports['./static'] = './src/static/index.ts';
  sourceExports['./symbol'] = './src/symbol/index.ts';
  for (const item of catalog) {
    sourceExports[`./symbol/${item.sourceBase}`] = `./src/symbol/${item.sourceBase}.ts`;
    if (item.instance) {
      const publicBase = kebabCase(item.publicOperatorName);
      sourceExports[`./pipeable/${publicBase}`] = `./src/pipeable/${publicBase}.ts`;
      if (withNames.has(item.symbolName)) {
        sourceExports[`./${publicBase}`] = `./src/pipeable/${publicBase}.ts`;
      }
    }
    if (item.static) {
      sourceExports[`./static/${item.sourceBase}`] = `./src/static/${item.sourceBase}.ts`;
    }
  }
  packageJson.tshy.exports = Object.fromEntries(Object.entries(sourceExports).sort(([left], [right]) => left.localeCompare(right)));
  await queueWrite(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  if (pendingWrites.length === 0) {
    console.log('The generated functional surface is current.');
    return;
  }
  if (checkOnly) {
    console.error('The generated functional surface is stale:');
    for (const write of pendingWrites) {
      console.error(`- ${relative(repositoryRoot, write.path)}`);
    }
    process.exitCode = 1;
    return;
  }
  for (const write of pendingWrites) {
    await mkdir(dirname(write.path), { recursive: true });
    await writeFile(write.path, write.content);
  }
  console.log(`Updated ${pendingWrites.length} generated functional-surface files.`);
}

await main();
