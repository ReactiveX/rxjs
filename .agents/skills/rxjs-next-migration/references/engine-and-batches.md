# Engine registry and migration batches

Use this reference during Stages 5 and 6. `@rxjs/migrate` is a deterministic
engine for a bounded syntax subset. It is not an autonomous repository
migration tool.

## Consume installed contracts

Read engine data from the project's installed package, not from a list copied
into a prompt, Skill, or harness adapter. The public API exports the default
capability registry, registry and manifest schemas, migration functions,
contract readiness assessment, and engine/schema versions.

A local inspection can use the project's module runner with this shape:

```js
import { assessMigrationContractReadiness, defaultCapabilityRegistry, migrationContractManifestSchema } from '@rxjs/migrate';

for (const capability of defaultCapabilityRegistry.capabilities) {
  // Review id, legacy/source name, target Symbol, adapter, arity,
  // preconditions, status, and fixture evidence for this exact package.
}

const parsed = migrationContractManifestSchema.safeParse(manifest);
if (parsed.success) {
  const readiness = assessMigrationContractReadiness(parsed.data, {
    expectedSkillDigest,
  });
}
```

Obtain `expectedSkillDigest` from the installed adapter's integrity check or
the Node-only `@rxjs/migrate/skill` API. Consult the installed TypeScript
declarations for exact signatures. Refuse an incompatible custom registry
rather than adapting it informally. A registry entry proves only the source
forms, overloads, preconditions, and fixtures it names; it does not promise
general RxJS 7 compatibility.

## Capability selection

Before selecting a transform, verify all of the following:

- registry schema, registry version, and engine version match the installed
  package;
- the source import binding is the one identified by the engine and is not
  shadowed or repurposed;
- the call shape, arity, scheduler/result-selector form, and pipeline context
  satisfy every declared precondition;
- the fixture evidence covers the intended mapping and evidence class; and
- the migration unit already has an approved lifecycle contract.

Name similarity, a compatible TypeScript signature, or a green transformed
test is not a substitute for those checks.

## Dry-run protocol

Invoke the locally installed `rxjs-migrate` binary through the project's
package manager. Supply all required provenance. For example:

```sh
rxjs-migrate \
  --source-root <authorized-root> \
  --source-repo <source-repository> \
  --source-sha <exact-revision> \
  --mode <approved-cold-or-platform-mode> \
  --framework preserve \
  <selected-files>
```

Omit `--mode` when the selected source does not require a lifecycle choice.
Never let a directory name or wrapper select it implicitly. Use the package's
documented framework adapter only for a separately approved framework change.

Without `--write`, the CLI returns a versioned JSON report and performs no
writes. Record its engine version, registry version, operation, file results,
ordered diagnostics, and exit status. The current CLI contract distinguishes
completed, structured refusal, invalid arguments, and operational failure;
read the installed package documentation for the exact numeric codes.

Review every diagnostic, including source span, severity, disposition, refusal
scope, classification, next action, and capability ID when present. A refused
batch must leave source and destination unchanged.

## Write protocol

After the dry run and changed paths are approved, repeat the same inputs with
an explicit contained destination:

```sh
rxjs-migrate \
  --source-root <authorized-root> \
  --source-repo <source-repository> \
  --source-sha <exact-revision> \
  --mode <approved-cold-or-platform-mode> \
  --framework preserve \
  --write --out-dir <authorized-destination> \
  <selected-files>
```

The engine plans the whole batch before writing and refuses lexical, canonical,
or symlink path escape. Do not bypass containment or no-overwrite behavior with
manual bulk writes. If the reviewed destination is the current source tree,
make that scope and overwrite decision explicit and keep recovery possible.

Compare the write report with the dry run byte for byte where contractual.
Inspect the diff for:

- provenance and filenames;
- exact Symbol imports and calls;
- preserved unsupported source;
- lifecycle helper selection;
- awaited asynchronous test helpers;
- framework preservation or the separately selected adapter;
- retained assertions, errors, subscription claims, and local helpers; and
- absence of hidden generators or compatibility layers.

Then run the same transform again without writes. The second result must be
unchanged with stable diagnostics. Any output or diagnostic drift is an engine
defect; stop the batch and preserve a reproduction.

## Refusal and manual repair

Do not turn refused syntax into claimed mechanical output by editing around the
diagnostic. Carry the finding into the contract and choose one of these paths:

1. narrow the batch to independently safe units;
2. add characterization, obtain a developer decision, and make a reviewed
   semantic edit outside the engine's claimed output;
3. report an RxJS Next product gap; or
4. preserve the source and accept a named blocker.

Manual work remains subject to the same baseline, lifecycle, review, and
verification gates. It must not be described as fixture-proved engine output.
