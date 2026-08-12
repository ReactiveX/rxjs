<!--
Thank you very much for your pull request!

Use a Conventional Commit pull-request title because the squash-merge title
selects the release version. Examples: `fix(core): repair teardown`,
`feat(test): add scheduler helper`, or `feat(api)!: remove legacy behavior`.

If your PR is the addition of a new operator, please make sure all these boxes are ticked with an x:

- [ ] Add the operator to Rx
- [ ] It must have a `-spec.ts` tests file covering the canonical corner cases, with marble diagram tests
- [ ] The spec file should have a type definition test at the end of the spec to verify type definition for various use cases
- [ ] The operator must be documented in JSDoc style in the implementation file, including also the PNG marble diagram image
- [ ] The operator should be listed in `apps/rxjs.dev/content/guide/operators.md` in a category of operators
- [ ] The operator should also be documented. See [Documentation Guidelines](../CONTRIBUTING.md).
- [ ] You may need to update `MIGRATION.md` if the operator differs from the corresponding one in RxJS v4
-->

**Description:**

<!--
If this PR introduces a breaking change, it must contain a notice for it to be included in the CHANGELOG.
-->

**BREAKING CHANGE:** <!-- add description or remove entirely if not breaking -->

**Related issue (if exists):**
