import assert from 'node:assert/strict';
import test from 'node:test';
import { auditRetiredProductReferences } from './check-retired-products.mjs';

test('accepts a tree with only the plugin migration product', () => {
  assert.deepEqual(
    auditRetiredProductReferences(
      new Map([
        ['package.json', '{"name":"@rxjs/agent-plugin"}'],
        ['README.md', 'Use the read-only migration MCP.'],
      ])
    ),
    []
  );
});

test('rejects every retired package, workspace, and binary spelling', () => {
  const references = [
    ['@rxjs', 'migrate'].join('/'),
    ['packages', 'migrate'].join('/'),
    ['rxjs', 'migrate'].join('-'),
  ];
  const errors = auditRetiredProductReferences(
    new Map(references.map((reference, index) => [`fixture-${index}.txt`, `before ${reference} after`]))
  );
  assert.equal(errors.length, references.length);
  for (const reference of references) assert.match(errors.join('\n'), new RegExp(reference.replace('/', '\\/')));
});
