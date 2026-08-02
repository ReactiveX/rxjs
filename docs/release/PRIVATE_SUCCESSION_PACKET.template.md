# Private release succession packet template

Do not fill in or commit a completed copy. Store it in the organization's
approved private records system. Never include passwords, private keys, TFA
seeds, recovery codes, session cookies, or reusable tokens.

## Ownership inventory

- GitHub organization, repository, release App, protected environments, owner teams, and rulesets
- npm organization, four packages, maintainers, trusted publishers, and publishing-access settings
- Domain, documentation, security-reporting, and vendor-support ownership relevant to releases

## Evidence locations

- Public release runbook and release-doctor workflow
- GitHub ruleset and immutable-release configuration evidence
- npm trusted-publisher and publishing-access evidence
- Most recent disposable-package rehearsal and recovery exercise

## Vendor contact paths

- GitHub organization support and required ownership-change proof
- npm support for the RxJS package status and required authority-transfer proof
- Organization contact able to attest project authority

## Authority-transfer procedure

1. Verify the successor through independent governance.
2. Add the successor's own GitHub account to the release-maintainer team.
3. Add the successor's own npm account and require its own TFA enrollment.
4. Have the successor verify the runbook, doctor, rulesets, App, and trusted publishers.
5. Rehearse stage, inspect, reject, restage, TFA approval, and finalization on a disposable package.
6. Remove superseded accounts and rotate App credentials through vendor-supported controls.
7. Record the review date and next annual private reminder without copying secrets.
