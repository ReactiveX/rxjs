#!/usr/bin/env node

import { validatePullRequestTitle } from './release-policy.mjs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) throw new Error('Usage: validate-pr-title.mjs <pull-request-title>');
const result = validatePullRequestTitle(title);
process.stdout.write(`Validated ${result.type} Conventional Commit title (${result.level}).\n`);
