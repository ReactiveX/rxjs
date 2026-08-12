import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { inspectSkillIntegrity, verifySkillIntegrity } from './skill-integrity.js';

describe('Skill integrity', () => {
  const roots: string[] = [];

  afterEach(async () => {
    await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
  });

  it('is stable across creation order and detects changed bytes', async () => {
    const left = await fixture([['SKILL.md', 'workflow\n'], ['references/check.md', 'check\n']]);
    const right = await fixture([['references/check.md', 'check\n'], ['SKILL.md', 'workflow\n']]);
    const expected = await inspectSkillIntegrity(left);

    expect(await inspectSkillIntegrity(right)).toEqual(expected);
    expect(await verifySkillIntegrity(right, expected)).toBe(true);
    await writeFile(join(right, 'SKILL.md'), 'changed\n');
    expect(await verifySkillIntegrity(right, expected)).toBe(false);
  });

  it('refuses symlinked canonical content', async () => {
    const root = await fixture([['SKILL.md', 'workflow\n']]);
    await writeFile(join(root, '..', 'outside.md'), 'outside\n');
    await symlink(join(root, '..', 'outside.md'), join(root, 'linked.md'));

    await expect(inspectSkillIntegrity(root)).rejects.toThrow('must not contain symbolic links');
  });

  async function fixture(files: readonly (readonly [string, string])[]): Promise<string> {
    const root = await mkdtemp(join(tmpdir(), 'rxjs-migrate-skill-'));
    roots.push(root);
    for (const [file, content] of files) {
      const path = join(root, file);
      await mkdir(join(path, '..'), { recursive: true });
      await writeFile(path, content);
    }
    return root;
  }
});
