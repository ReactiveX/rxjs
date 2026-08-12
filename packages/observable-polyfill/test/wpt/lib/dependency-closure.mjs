const alwaysRequired = [
  'LICENSE.md',
  'resources/testharness.js',
  'resources/testharnessreport.js',
];

const servedPathRewrites = new Map([
  ['/resources/WebIDLParser.js', 'resources/webidl2/lib/webidl2.js'],
]);

function toImportedPath(servedPath) {
  return servedPathRewrites.get(servedPath) ?? servedPath.replace(/^\//, '');
}

export function deriveRequiredSupportFiles(testFiles) {
  const required = new Set(alwaysRequired);

  for (const source of testFiles.values()) {
    for (const match of source.matchAll(/^\s*\/\/\s*META:\s*script=(\/\S+)\s*$/gm)) {
      required.add(toImportedPath(match[1]));
    }
    for (const match of source.matchAll(/<script\s+[^>]*src=["'](\/[^"']+)["'][^>]*>/gi)) {
      required.add(toImportedPath(match[1]));
    }
    for (const match of source.matchAll(/idl_test\(\s*\[([^\]]*)\]\s*,\s*\[([^\]]*)\]/g)) {
      for (const listSource of [match[1], match[2]]) {
        for (const nameMatch of listSource.matchAll(/["']([^"']+)["']/g)) {
          required.add(`interfaces/${nameMatch[1]}.idl`);
        }
      }
    }
  }

  return [...required].sort();
}

export function verifyRequiredSupportFiles(testFiles, configuredSupportFiles) {
  const required = deriveRequiredSupportFiles(testFiles);
  const configured = [...configuredSupportFiles].sort();
  if (JSON.stringify(required) === JSON.stringify(configured)) {
    return [];
  }

  const requiredSet = new Set(required);
  const configuredSet = new Set(configured);
  return [
    ...required.filter((filePath) => !configuredSet.has(filePath)).map(
      (filePath) => `missing required WPT support file: ${filePath}`
    ),
    ...configured.filter((filePath) => !requiredSet.has(filePath)).map(
      (filePath) => `unexplained WPT support file: ${filePath}`
    ),
  ];
}
