import {Component} from '@angular/core';
import {Subject} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';
import {environment} from '../../../../../../environments/environment';
import {LocationService} from '../../../../../shared/location.service';
import {parseMigrationItemUIDURL} from '../../../data-access/migration-item';
import {BreakingChange, Deprecation, MigrationReleaseItem} from '../../../data-access/migration-timeline-struckture/migration-item';
import {parseMigrationItemUIDObject} from '../../../data-access/migration-timeline-struckture/migration-uid';
import {State} from '../../../utils';

@Component({
  selector: `missing-information`,
  template: `
    <mat-card class="migration-section manual-step selected suggestion-open-issue">
      <mat-card-header id="wrong-uid" class="migration-headline">
        <mat-card-title>Migration information is missing!</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>
          We suggest you go to the RxJS GitHub page and
          <a [href]="link$ | async" target="_blank"> open an issue</a>
          <span *ngIf="!env.production"> or <mat-icon
            copy-to-clipboard
            [content]="contentToCopy$ | async">
          content_copy
        </mat-icon>
            </span>
        </p>
        <deprecation-item-form (changes)="formOutput$.next($event)"></deprecation-item-form>
        <mat-icon class="img" aria-hidden="false" aria-label="Missing Documentation">error_outline</mat-icon>
      </mat-card-content>
    </mat-card>
  `
})
export class MissingInformationComponent extends State<{ deprecation: Deprecation }> {

  env = environment;
  formOutput$ = new Subject<Deprecation>();

  private deprecation$ = this.select('deprecation');
  private migrationItemUIDObject$ = this.lo.currentSearchParams
    .pipe(map(p => parseMigrationItemUIDObject(p.uid)));

  contentToCopy$ = this.deprecation$.pipe(
    withLatestFrom(this.migrationItemUIDObject$),
    map(([deprecation, uidObj]) => {
      const snippet: MigrationReleaseItem[] = [
        {
          version: uidObj.version,
          date: '',
          deprecations: [deprecation],
          breakingChanges: []
        },
        {
          version: deprecation.breakingChangeVersion,
          date: '',
          deprecations: [],
          breakingChanges: [getBreakingChangeFromDeprecation(deprecation,
            {deprecationVersion: uidObj.version, breakingChangeMsg: 'removed'}
          )]
        }
      ];
      return JSON.stringify(snippet);
    })
  );

  link$ = this.lo.currentSearchParams
    .pipe(
      map(p => {
        const o = parseMigrationItemUIDObject(p.uid);
        const s = parseMigrationItemUIDURL(p.uid);
        return `https://github.com/ReactiveX/rxjs/issues/new?
title=[docs] Missing ${o.itemType} information for ${o.subject} in version ${o.version}&
body=The ID ${s} is not linked to any item of the migration timeline.\n Please insert the information.&
template=documentation.md`;
      })
    );

  constructor(private lo: LocationService) {
    super();
    this.connectState('deprecation', this.formOutput$);
  }

}


function getBreakingChangeFromDeprecation(d: Deprecation, r: { deprecationVersion: string, breakingChangeMsg: string }): BreakingChange {
  return {
    itemType: 'breakingChange',
    subject: d.subject,
    subjectSymbol: d.subjectSymbol,
    subjectAction: d.breakingChangeSubjectAction,
    deprecationVersion: r.deprecationVersion,
    deprecationSubjectAction: d.subjectAction,
    breakingChangeMsg: r.breakingChangeMsg
  };
}


