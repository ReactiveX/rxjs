#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { validateConventionalTitle } from './conventional-commit.mjs';

const messagePath = process.argv[2];
if (!messagePath) throw new Error('Usage: validate-commit-message.mjs <commit-message-file>');
const [title] = (await readFile(messagePath, 'utf8')).split(/\r?\n/);
const result = validateConventionalTitle(title.trim());
process.stdout.write(`Validated ${result.type} Conventional Commit message.\n`);
