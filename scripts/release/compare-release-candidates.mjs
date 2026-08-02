#!/usr/bin/env node

import path from 'node:path';
import { compareCandidates } from './release-candidate.mjs';

const [first, second, output] = process.argv.slice(2);
if (!first || !second || !output) throw new Error('Usage: compare-release-candidates.mjs <first> <second> <output>');
const manifest = await compareCandidates(path.resolve(first), path.resolve(second), path.resolve(output));
process.stdout.write(`${JSON.stringify({ version: manifest.version, sourceCommit: manifest.sourceCommit, reproducible: true })}\n`);
