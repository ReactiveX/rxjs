# Generated migration capabilities

> Generated from the beta.1 deterministic capability registry. Do not edit by hand.

The migration MCP currently proves these bounded rewrites:

- `operator.filter`
- `operator.map`
- `operator.take-until`
- `operator.buffer-count`
- `operator.concat-map`
- `operator.concat-all`
- `operator.switch-all`
- `operator.debounce-time`
- `operator.audit`
- `operator.audit-time`

Call `migration_capabilities` for the authoritative preconditions, arity,
argument adapter, evidence classification, and review notes. Anything absent
from that response requires an authored migration decision, not an inferred
mechanical rewrite.
