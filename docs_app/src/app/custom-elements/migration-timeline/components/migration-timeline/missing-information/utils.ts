import {
  BreakingChange,
  MigrationItemSubjectUIDFields,
  MigrationReleaseUIDFields, parseToMigrationItemUIDAware,
  trimReservedLinkChars,
  trimReservedUrlChars
} from '../../../data-access';
import {RawDeprecation, RawRelease} from '../../../data-access/migration-timeline-structure';

export function fillRelease(
  r: any = {},
  defaultOverrides: Partial<RawRelease> = {}
): RawRelease {
  const parsedRelease: RawRelease = {
    version: '@TODO',
    deprecations: [],
    date: '@TODO',
    sourceLink: '@TODO',
    ...defaultOverrides
  };
  r.version && (parsedRelease.version = r.version);
  r.date && (parsedRelease.date = r.date) || (parsedRelease.date = new Date('2021-01-01').toISOString());
  r.deprecations && (parsedRelease.deprecations = r.deprecations);
  r.sourceLink && (parsedRelease.version = r.sourceLink);
  return parsedRelease;
}

export function fillDeprecation(
  d: any = {} as any,
  defaultOverrides: Partial<RawDeprecation> = {}
): RawDeprecation {
  const parsedDeprecation: RawDeprecation = {
    itemType: 'deprecation',
    subject: '~subject~',
    subjectAction: '~subjectActionSymbol~-~subjectAction~',
    subjectSymbol: '~subjectSymbol~' as any,
    reason: '@TODO',
    implication: '@TODO',
    sourceLink: '@TODO',
    deprecationMsgCode: '@TODO',
    breakingChangeVersion: '@TODO',
    breakingChangeSubjectAction: '@TODO',
    breakingChangeMsg: '@TODO',
    ...defaultOverrides
  };
  d.subject && (parsedDeprecation.subject = trimReservedLinkChars(trimReservedUrlChars(d.subject)));
  d.subjectSymbol && (parsedDeprecation.subjectSymbol = d.subjectSymbol);
  d.sourceLink && (parsedDeprecation.sourceLink = d.sourceLink);
  d.deprecationMsgCode && (parsedDeprecation.deprecationMsgCode = d.deprecationMsgCode);
  d.reason && (parsedDeprecation.reason = d.reason);
  d.implication && (parsedDeprecation.implication = d.implication);
  d.exampleBefore && (parsedDeprecation.exampleBefore = d.exampleBefore);
  d.exampleBeforeDependencies && (parsedDeprecation.exampleBeforeDependencies = d.exampleBeforeDependencies);
  d.exampleAfter && (parsedDeprecation.exampleAfter = d.exampleAfter);
  d.exampleAfterDependencies && (parsedDeprecation.exampleAfterDependencies = d.exampleAfterDependencies);
  d.implication && (parsedDeprecation.implication = d.implication);
  d.breakingChangeVersion && (parsedDeprecation.breakingChangeVersion = d.breakingChangeVersion);
  d.breakingChangeSubjectAction && (parsedDeprecation.breakingChangeSubjectAction = d.breakingChangeSubjectAction);
  d.breakingChangeMsg && (parsedDeprecation.breakingChangeMsg = d.breakingChangeMsg);

  return parsedDeprecation;
}

export function generateSnipped(deprecation: RawDeprecation, uidObj: MigrationItemSubjectUIDFields & MigrationReleaseUIDFields): string {
  const snippet: RawRelease[] = [
    {
      version: uidObj.version,
      date: '',
      sourceLink: `https://github.com/ReactiveX/rxjs/tree/master/${uidObj.version}`,
      deprecations: [deprecation]
    }
  ];
  return JSON.stringify(snippet);
}

export function getIssuePreFill(uidObj: MigrationItemSubjectUIDFields & MigrationReleaseUIDFields, itemUIDURL: string): string {
  return `https://github.com/ReactiveX/rxjs/issues/new?
      title=[docs] Missing ${uidObj.itemType} information for ${uidObj.subject} in version ${uidObj.version}&
      body=The ID ${itemUIDURL} is not linked to any item of the migration timeline.\n Please insert the information.&
      template=documentation.md
      `;
}


export function getBreakingChangeFromDeprecation(d: RawDeprecation, r: { deprecationVersion: string }): BreakingChange {
  return parseToMigrationItemUIDAware<BreakingChange>(r.deprecationVersion)({
    itemType: 'breakingChange',
    subject: d.subject,
    subjectSymbol: d.subjectSymbol,
    subjectAction: d.breakingChangeSubjectAction,
    deprecationVersion: r.deprecationVersion,
    deprecationSubjectAction: d.subjectAction,
    breakingChangeMsg: d.breakingChangeMsg
  });
}

