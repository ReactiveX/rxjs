import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

rmSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/api'), { force: true, recursive: true });
