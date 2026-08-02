#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { releaseBotAllowedFiles } from './release-config.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const base = process.argv[2] ?? 'HEAD';
const result = spawnSync('git', ['diff', '--name-only', base], { cwd: root, encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr);
const files = result.stdout.split('\n').filter(Boolean);
const forbidden = files.filter((file) => !releaseBotAllowedFiles.has(file));
if (forbidden.length > 0) throw new Error(`Release automation changed forbidden files:\n- ${forbidden.join('\n- ')}`);
process.stdout.write(`Release automation changed only ${files.length} allowlisted file(s).\n`);
