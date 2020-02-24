import {ChangeDetectionStrategy, Component} from '@angular/core';
import {combineLatest, Subject} from 'rxjs';
import {map, startWith, withLatestFrom} from 'rxjs/operators';
import {environment} from '../../../../../../environments/environment';
import {LocationService} from '../../../../../shared/location.service';
import {State} from '../../../../../shared/state.service';
import {parseMigrationItemUIDObject, parseMigrationItemUIDURL, RawDeprecation, RawRelease} from '../../../data-access';
import {fillDeprecation, fillRelease, generateSnipped, getBreakingChangeFromDeprecation, getIssuePreFill} from './utils';


@Component({
  selector: `missing-information`,
  template: `
    <mat-card class="migration-section manual-step selected suggestion-open-issue">
      <mat-card-header id="wrong-uid" class="migration-headline">
        <mat-card-title>Migration information is missing!</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="half">
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
        </div>
        <br/>
        <div class="row">
          <div class="half col">
            <deprecation-item-form
              (changes)="formOutput$.next($event)"
              (release)="releaseFormOutput$.next($event)"
            ></deprecation-item-form>
          </div>
          <div class="half col">
            <preview [release]="releaseToPreview$"></preview>
          </div>
        </div>
        <mat-icon class="img" aria-hidden="false" aria-label="Missing Documentation">error_outline</mat-icon>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .row {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }

    .row > .col {
      box-sizing: border-box;
      margin: 10px 10px 0 0;
      width: 100%;
    }

    .row::after {
      content: '';
      flex: auto;
    }

    .row > .col.half {
      width: calc(1 / 2 * 100% - (1 - 1 / 3) * 10px);
    }

    .row > .col.half:nth-child(2n) {
      margin-right: 0;
    }

    .row > .col.half:nth-child(-n+2) {
      margin-top: 0;
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissingInformationComponent extends State<{ deprecation: RawDeprecation, release: RawRelease }> {

  env = environment;
  formOutput$ = new Subject<RawDeprecation>();
  releaseFormOutput$ = new Subject<RawRelease>();

  private deprecation$ = this.select('deprecation');
  private release$ = this.select('release');
  private migrationItemUIDObject$ = this.lo.currentSearchParams
    .pipe(map(p => parseMigrationItemUIDObject(p.uid)));

  releaseToPreview$ = combineLatest(
    this.release$,
    this.deprecation$,
  ).pipe(
    startWith([{}, {}]),
    map(([release, deprecation]: [RawRelease, RawDeprecation]) => {
      const previewRelease =  fillRelease(release,
        {
          deprecations: [fillDeprecation(deprecation)],
        });
      previewRelease['breakingChanges'] = [getBreakingChangeFromDeprecation(
        previewRelease.deprecations[0], {deprecationVersion: release.version})];
      return previewRelease;
    }),
  );
  contentToCopy$ = this.deprecation$.pipe(
    withLatestFrom(this.migrationItemUIDObject$),
    map(([deprecation, uidObj]) => generateSnipped(deprecation, uidObj))
  );

  link$ = this.lo.currentSearchParams
    .pipe(
      map(p => {
        const uidObj = parseMigrationItemUIDObject(p.uid);
        const itemUIDURL = parseMigrationItemUIDURL(p.uid);
        return getIssuePreFill(uidObj, itemUIDURL);
      })
    );

  constructor(private lo: LocationService) {
    super();
    this.connectState('deprecation', this.formOutput$);
    this.connectState('release', this.releaseFormOutput$);
  }

}

