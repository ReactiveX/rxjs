import {Component} from '@angular/core';
import {concat, merge, Observable, of, Subject} from 'rxjs';
import {map, switchMap, take, delay, tap, distinctUntilChanged} from 'rxjs/operators';
import {LocationService} from '../../shared/location.service';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {VmMigrationListItem, VmReleaseNavigationItem} from './interfaces';
import {LocalState} from './utils/local-state.service';
import {closestRelevantVersion, latestRelevantVersion} from './utils/operators';
import {parseVmMigrationList, parseVmReleaseNavigation} from './utils/vm-model.parser';

@Component({
  selector: `rxjs-migration-timeline-container`,
  template: `
    <h1>RxJS Migration Timeline</h1>
    <p>
      Some Text here...
    </p>
    <h2>Supported Versions</h2>
    <div class="flex-center group-buttons">
      <mat-chip-list>
        <a *ngFor="let option of releaseNavigation$ | async"
          [href]="baseURL + '#' + option.version"
          class="mat-chip mat-primary mat-standard-chip"
          [ngClass]="{selected:(selectedVersion$ | async) === option.version}">
          {{option.version}}
        </a>
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
    </section>`
})
export class MigrationTimelineContainerComponent
  extends LocalState<{
    selectedVersion?: string,
    releaseNavigation?: VmReleaseNavigationItem[],
    migrationList: VmMigrationListItem[]
  }> {
  baseURL = 'migration-timeline';
  // UI
  selectedVersionChange$ = new Subject<string>();

  // derivations
  releaseNavigation$ = this.select(map(s => s.releaseNavigation));
  migrationList$ = this.select(map(s => s.migrationList));
  selectedVersion$ = concat(
    this.select(map(s => s.selectedVersion))
  );

  urlVersion$ = this.locationService.currentHash;
  latestRelevantVersion$: Observable<string> = of(new Date())
    .pipe(latestRelevantVersion(this.migrationList$));
  initialVersion$: Observable<string> = this.locationService.currentHash
    .pipe(switchMap((hash: string) => hash === undefined ?
      this.latestRelevantVersion$ : of(hash).pipe(closestRelevantVersion(this.migrationList$))), take(1)
    );

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
      .pipe(map(parseVmMigrationList(this.baseURL + '#')), map(migrationList => ({migrationList}))));

    // initial values
    this.connectSlice(this.initialVersion$
      .pipe(map(selectedVersion => ({selectedVersion}))));

    // UI interactions
    this.selectedVersionChange$.pipe(
      distinctUntilChanged(),
      tap(v => this.locationService.go('migration-timeline#' + v))
    ).subscribe();
    this.connectSlice(
      merge(
        // this.selectedVersionChange$,
        this.urlVersion$.pipe(closestRelevantVersion(this.migrationList$))
      )
        .pipe(
          map(selectedVersion => ({selectedVersion})),
          delay(200)
        ));
  }

}

