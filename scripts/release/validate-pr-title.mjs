#!/usr/bin/env node

import { validateConventionalTitle } from './conventional-commit.mjs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) throw new Error('Usage: validate-pr-title.mjs <pull-request-title>');
const result = validateConventionalTitle(title);
process.stdout.write(`Validated ${result.type} Conventional Commit title.\n`);
