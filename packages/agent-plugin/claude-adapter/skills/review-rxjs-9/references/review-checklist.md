# RxJS 9 review checklist

For each source and derived value record:

- constructor/realm and native-versus-fallback selection;
- exact imported Symbol and public subpath;
- producer creation, concurrent joining, last-observer teardown, and restart;
- local AbortController and joined signal ownership;
- input conversion category and realm;
- synchronous callback/setup error path;
- completion/error ordering and teardown;
- Subject current/replay/terminal ownership;
- tests for native/fallback parity and intended cold/platform differences.

Do not flag ordinary shared platform behavior as a bug merely because RxJS 7
would create work per subscription. Do flag documentation, types, or tests that
describe the wrong lifecycle.
