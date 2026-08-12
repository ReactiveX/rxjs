# RxJS security policy

RxJS currently has one active maintainer. The same maintainer may author, review, merge, and release a change. The project does not claim independent human review; release safety relies on mandatory automation, reproducible artifacts, narrow credentials, separate GitHub/npm authorization, and public verification evidence.

## Supported versions

| Release line       | Status                                     | Security support                                                                                               |
| ------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| RxJS 9.x           | Prerelease until stable                    | The latest published 9.x prerelease receives security fixes while the beta is active.                          |
| RxJS 7.x           | Production `latest` during the RxJS 9 beta | The latest 7.x release receives security fixes and high-severity correctness or ecosystem-compatibility fixes. |
| RxJS 6.x and older | End of life                                | No security updates.                                                                                           |

When RxJS 9 becomes stable, its latest release becomes the supported production line. Any future change to RxJS 7 support will be announced separately; this policy does not invent a sunset date.

## Report a vulnerability privately

Do not open a public issue for a suspected vulnerability. Use a [private GitHub security advisory](https://github.com/ReactiveX/rxjs/security/advisories/new) and include the affected version, impact, reproduction, and any known workaround.

The maintainer targets:

- acknowledgment within five business days;
- an initial assessment within ten business days;
- case-specific remediation and coordinated-disclosure timing after assessment.

These are response targets, not guaranteed fix deadlines. If investigation or coordination takes longer, the reporter will receive an update explaining the delay and the next expected checkpoint.

See [RxJS 9 security assurance](packages/rxjs/docs/SECURITY_ASSURANCE.md) for release controls, verification commands, limitations, and the current supply-chain evidence model.
