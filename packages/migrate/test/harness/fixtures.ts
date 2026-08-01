export type HarnessId = 'codex' | 'claude' | 'cursor';

export interface HarnessSmokeFixture {
  readonly harness: HarnessId;
  readonly discoveryPath: string;
  readonly explicitInvocation: string;
  readonly implicitInvocation: string;
  readonly permissionExpectations: {
    readonly repositoryRead: true;
    readonly reviewedPathsWrite: true;
    readonly localProjectCommands: true;
    readonly localToolsRequestedNotAssumed: true;
    readonly networkRequiresApproval: true;
    readonly productionCredentials: false;
    readonly projectMcpWrite: false;
    readonly destructiveActions: false;
    readonly externalPublication: false;
  };
}

const leastPrivilegePermissions = {
  repositoryRead: true,
  reviewedPathsWrite: true,
  localProjectCommands: true,
  localToolsRequestedNotAssumed: true,
  networkRequiresApproval: true,
  productionCredentials: false,
  projectMcpWrite: false,
  destructiveActions: false,
  externalPublication: false,
} as const;

/**
 * Public harness promises from D-046. These fixtures intentionally contain no
 * migration workflow or capability prose: every harness must discover the
 * same canonical Skill bytes shipped by @rxjs/migrate.
 */
export const harnessSmokeFixtures: readonly HarnessSmokeFixture[] = [
  {
    harness: 'codex',
    discoveryPath: '.agents/skills/rxjs-next-migration/SKILL.md',
    explicitInvocation: '$rxjs-next-migration',
    implicitInvocation: 'Migrate this RxJS 7 project to RxJS Next.',
    permissionExpectations: leastPrivilegePermissions,
  },
  {
    harness: 'claude',
    discoveryPath: '.claude/skills/rxjs-next-migration/SKILL.md',
    explicitInvocation: '/rxjs-next-migration',
    implicitInvocation: 'Migrate this RxJS 7 project to RxJS Next.',
    permissionExpectations: leastPrivilegePermissions,
  },
  {
    harness: 'cursor',
    discoveryPath: '.agents/skills/rxjs-next-migration/SKILL.md',
    explicitInvocation: '/rxjs-next-migration',
    implicitInvocation: 'Migrate this RxJS 7 project to RxJS Next.',
    permissionExpectations: leastPrivilegePermissions,
  },
] as const;
