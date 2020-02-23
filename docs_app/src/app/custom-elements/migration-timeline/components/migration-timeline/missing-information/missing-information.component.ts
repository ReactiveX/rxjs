import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Subject} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';
import {environment} from '../../../../../../environments/environment';
import {LocationService} from '../../../../../shared/location.service';
import {State} from '../../../../../shared/state.service';
import {
  MigrationItemSubjectUIDFields,
  MigrationReleaseUIDFields,
  parseMigrationItemUIDObject,
  parseMigrationItemUIDURL,
  RawDeprecation,
  RawRelease
} from '../../../data-access';


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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissingInformationComponent extends State<{ deprecation: RawDeprecation }> {

  env = environment;
  formOutput$ = new Subject<RawDeprecation>();

  private deprecation$ = this.select('deprecation');
  private migrationItemUIDObject$ = this.lo.currentSearchParams
    .pipe(map(p => parseMigrationItemUIDObject(p.uid)));

  contentToCopy$ = this.deprecation$.pipe(
    withLatestFrom(this.migrationItemUIDObject$),
    map(([deprecation, uidObj]) => this.generateSnipped(deprecation, uidObj))
  );

  link$ = this.lo.currentSearchParams
    .pipe(
      map(p => {
        const uidObj = parseMigrationItemUIDObject(p.uid);
        const itemUIDURL = parseMigrationItemUIDURL(p.uid);
        return this.getIssuePreFill(uidObj, itemUIDURL);
      })
    );

  constructor(private lo: LocationService) {
    super();
    this.connectState('deprecation', this.formOutput$);
  }

  generateSnipped(deprecation: RawDeprecation, uidObj: MigrationItemSubjectUIDFields & MigrationReleaseUIDFields): string {
    const snippet: RawRelease[] = [
      {
        version: uidObj.version,
        date: '',
        sourceLink: '',
        deprecations: [deprecation]
      },
      {
        version: deprecation.breakingChangeVersion,
        date: '',
        sourceLink: '',
        deprecations: []
      }
    ];
    return JSON.stringify(snippet);
  }

  getIssuePreFill(uidObj: MigrationItemSubjectUIDFields & MigrationReleaseUIDFields, itemUIDURL: string): string {
    return `https://github.com/ReactiveX/rxjs/issues/new?
      title=[docs] Missing ${uidObj.itemType} information for ${uidObj.subject} in version ${uidObj.version}&
      body=The ID ${itemUIDURL} is not linked to any item of the migration timeline.\n Please insert the information.&
      template=documentation.md
      `;
  }

}

