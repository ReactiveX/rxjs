# RxJS Next project documents

These documents define the development foundation for the platform-observable
branch. The working project name is **RxJS Next**. The eventual major version is
likely RxJS 9, but that name is not final.

The documentation snapshot was created from branch `platform-observable` at
commit `9e94c090e` on 2026-07-24.

## Document map

| Document                                        | Purpose                                                                                                     |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [Project charter](PROJECT_CHARTER.md)           | Why the project exists, its goals, boundaries, and success criteria                                         |
| [Architecture](ARCHITECTURE.md)                 | Current implementation, intended target architecture, invariants, and known gaps                            |
| [Compatibility strategy](COMPATIBILITY.md)      | How platform semantics, RxJS 7 behavior, operator tests, and migration fit together                         |
| [Why Symbol operators](WHY_SYMBOL_OPERATORS.md) | A short user-facing explanation of Symbol operators, safe mutation, composition, and pipeable compatibility |
| [Project plan](PROJECT_PLAN.md)                 | Active execution queue, phases, gates, risks, and session log                                               |
| [Decision log](DECISIONS.md)                    | Accepted, proposed, and deferred architectural decisions                                                    |
| [Open questions](OPEN_QUESTIONS.md)             | Decisions that still require explicit resolution                                                            |

Repository-wide AI and contributor guidance is in
[`AGENTS.md`](../../AGENTS.md).

## How to read status statements

The branch is an exploratory implementation. These documents use the following
terms deliberately:

- **Current fact**: verified in the branch source, configuration, tests, or
  history.
- **Accepted direction**: a project constraint stated by the project owner and
  treated as architectural intent.
- **Proposal**: a recommended design that still needs an explicit decision.
- **Open question**: an unresolved choice whose answer could materially change
  implementation.
- **Deferred**: an accepted goal that is intentionally not being designed yet.

When current code conflicts with an accepted direction, the accepted direction
describes the target and the mismatch is documented as debt. Current code does
not silently become policy.

## Authoritative external references

The web-platform API is a living proposal. These links identify the current
upstream sources, but implementation work must pin an exact revision:

- [Observable specification](https://wicg.github.io/observable/)
- [Observable proposal and explainer](https://github.com/WICG/observable)
- [Observable Web Platform Test results](https://wpt.fyi/results/dom/observable/tentative?label=experimental&label=master&aligned)
- [Observable Web Platform Test sources](https://github.com/web-platform-tests/wpt/tree/master/dom/observable/tentative)

## Maintenance rule

Architecture, public API, compatibility, packaging, or conformance changes are
incomplete until the relevant document and decision status are updated. The
documents should remain concise enough to read before making a change and
specific enough that a human or AI contributor can tell whether an assumption
is fact, intent, or unresolved.
