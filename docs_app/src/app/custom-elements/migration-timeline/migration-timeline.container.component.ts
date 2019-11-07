import {Component, ViewEncapsulation} from '@angular/core';
import {concat, Observable, of, Subject} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import {LocationService} from '../../shared/location.service';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {VmMigrationListItem, VmReleaseNavigationItem} from './interfaces';
import {LocalState} from './utils/local-state.service';
import {getLatestRelevantVersion, parseVmMigrationList, parseVmReleaseNavigation} from './utils/vm-model.parser';

@Component({
  selector: `rxjs-migration-timeline-container`,
  template: `
    <h1>RxJS Migration Timeline</h1>
    <p>
      Some Text here...
    </p>
    <h2>Supported Versions</h2>
    selectedVersion$: {{selectedVersion$ | async}}
    <div class="flex-center group-buttons">
      <mat-chip-list>
        <mat-chip
          *ngFor="let option of releaseNavigation$ | async"
          [selected]="(selectedVersion$ | async) === option.version"
          (click)="selectedVersionChange$.next(option.version)">
          {{option.version}}
        </mat-chip>
      </mat-chip-list>
    </div>
    <h2>Timeline</h2>
    <section class="grid-fluid">
      <div class="release-group">
   <rxjs-migration-timeline
          [migrationList]="migrationList$ | async"
          [selectedVersion]="selectedVersion$ | async"
          (selectedVersionChange)="selectedVersionChange$.next($event)">
        </rxjs-migration-timeline>
      </div>
    </section>`,
  styles: [`
    .migration-timeline {
      background: transparent;
      box-shadow: none !important;
    }

    .migration-timeline {
      background: transparent;
      box-shadow: none !important;
    }

    .migration-card.mat-card {
      margin-bottom: 15px;
    }

    .release-link {
      text-transform: none;
    }


    .migration-card .mat-card-title {
      font-size: 18px;
    }

    .migration-card .mat-card-header-text {
      margin: 0;
    }
    .section-headline {
      padding-left: 35px;
      position: relative;
    }
    .section-headline .mat-icon {
      position: absolute;
      left: 0;
      top: -3px;
    }

    .release-shield {
      font-size: 14px;
      border-radius: 4px;
      overflow: hidden;
    }
    .release-shield .label,
    .release-shield .version {
      padding: 3px 3px 4px;
    }
    .release-shield .label {
      background: #4d4d4c;
      color: #fff;
      padding-left: 4px;
    }
    .release-shield .version {
      background: #1E88E5;
      color: #fff;
      padding-right: 5px;
    }

    .migration-card table th.subject {
      text-transform: none;
      position: relative;
      padding-left: 35px;
    }

    .migration-card table th.subject .symbol {
      margin-right: 5px;
      left: 15px;
      position: absolute;
      top: 17px;
    }

    .migration-card table th.subject code {
      border: 1px solid #DBDBDB;
      background-color: #FAFAFA;
      padding-left: 4px;
      padding-right: 4px;
    }

    .migration-card .mat-card-actions {
      display: flex;
      justify-content: right;
      align-content: flex-end;
    }

    .migration-card table {
      width: 100%;
    }

    .release.selected .mat-expansion-panel-header-title {
      color: #d81b60 !important;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class MigrationTimelineContainerComponent
  extends LocalState<{
    selectedVersion?: string,
    releaseNavigation?: VmReleaseNavigationItem[],
    migrationList?: VmMigrationListItem[]
  }> {
  // UI
  selectedVersionChange$ = new Subject<string>();

  // derivations
  releaseNavigation$ = this.select(s => s.releaseNavigation);
  migrationList$ = this.select(s => s.migrationList);
  selectedVersion$ = concat(
    this.select(s => s.selectedVersion)
  );

  latestRelevantVersion$: Observable<string> = this.migrationList$
    .pipe(map(getLatestRelevantVersion));
  initialVersion$: Observable<string> = this.locationService.currentHash
    .pipe(switchMap(h => h === undefined ? this.latestRelevantVersion$ : of(h)), take(1));

  constructor(
    private migrationService: MigrationTimelineService,
    private locationService: LocationService
  ) {
    super();
    // (re)fetch data  over http request
    this.migrationService.fetchMigrationTimeline();

    // Global state to view view state
    this.connectSlice(this.migrationService.migrations$
      .pipe(map(parseVmReleaseNavigation), map(releaseNavigation => ({releaseNavigation}))));
    this.connectSlice(this.migrationService.migrations$
      .pipe(map(parseVmMigrationList('migration-timeline#')), map(migrationList => ({migrationList}))));

    // initial values
    this.connectSlice(this.initialVersion$
      .pipe(map(selectedVersion => ({selectedVersion}))));

    // UI interactions
    this.connectSlice(this.selectedVersionChange$
      .pipe(
        map(selectedVersion => ({selectedVersion}))
      ));
  }

}

