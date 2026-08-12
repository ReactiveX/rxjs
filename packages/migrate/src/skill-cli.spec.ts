import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { runSkillCli, skillCliExitCodes, type SkillCliIo } from './skill-cli.js';

const canonicalSkillRoot = fileURLToPath(new URL('../skill', import.meta.url));

describe('Skill installer CLI', () => {
  const roots: string[] = [];
  afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))));

  it('installs and checks a harness copy with structured results', async () => {
    const projectRoot = await temporaryRoot();
    const install = capture();
    expect(await runSkillCli(['install', '--harness', 'codex', '--project-root', projectRoot], install.io, canonicalSkillRoot)).toBe(
      skillCliExitCodes.success
    );
    expect(JSON.parse(install.stdout()).result).toMatchObject({ stateBefore: 'absent', stateAfter: 'current', changed: true });

    const check = capture();
    expect(await runSkillCli(['check', '--harness', 'cursor', '--project-root', projectRoot], check.io, canonicalSkillRoot)).toBe(
      skillCliExitCodes.success
    );
    expect(JSON.parse(check.stdout()).result).toMatchObject({ adapter: 'agents', stateAfter: 'current', changed: false });
  });

  it('distinguishes invalid arguments from operational failures', async () => {
    const invalid = capture();
    expect(await runSkillCli(['install'], invalid.io, canonicalSkillRoot)).toBe(skillCliExitCodes.invalidArguments);
    expect(JSON.parse(invalid.stderr()).error.code).toBe('invalid-arguments');

    const operational = capture();
    const existingRoot = await temporaryRoot();
    expect(
      await runSkillCli(
        ['check', '--harness', 'claude', '--project-root', join(existingRoot, 'missing')],
        operational.io,
        canonicalSkillRoot
      )
    ).toBe(skillCliExitCodes.operationalFailure);
    expect(JSON.parse(operational.stderr()).error.code).toBe('operational-failure');
  });

  async function temporaryRoot(): Promise<string> {
    const root = await mkdtemp(join(tmpdir(), 'rxjs-skill-cli-'));
    roots.push(root);
    return root;
  }
});

function capture(): { readonly io: SkillCliIo; stdout(): string; stderr(): string } {
  let stdout = '';
  let stderr = '';
  return {
    io: {
      stdout: { write: (chunk: string | Uint8Array) => ((stdout += String(chunk)), true) },
      stderr: { write: (chunk: string | Uint8Array) => ((stderr += String(chunk)), true) },
    },
    stdout: () => stdout,
    stderr: () => stderr,
  };
}
