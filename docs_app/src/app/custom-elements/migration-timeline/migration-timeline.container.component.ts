import {Component, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {VmMigrationListItem, VmReleaseNavigationItem} from './interfaces';
import {LocalState} from './utils/local-state.service';
import {parseVmMigrationList, parseVmReleaseNavigation} from './utils/vm-model.parser';

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
  initVersion = '6.5.1';

  selectedVersionChange$ = new Subject<string>();
  // derivations
  selectedVersion$ = this.select(s => s.selectedVersion)
    .pipe(startWith(this.initVersion));
  releaseNavigation$ = this.select(s => s.releaseNavigation);
  migrationList$ = this.select(s => s.migrationList);


  constructor(private migrationService: MigrationTimelineService) {
    super();
    this.migrationService.fetchMigrationTimeline();

    this.connectSlice(this.migrationService.migrations$
      .pipe(map(parseVmReleaseNavigation), map(releaseNavigation => ({releaseNavigation}))));
    this.connectSlice(this.migrationService.migrations$
      .pipe(map(parseVmMigrationList), map(migrationList => ({migrationList}))));
    this.connectSlice(this.selectedVersionChange$
      .pipe(startWith(this.initVersion), map(selectedVersion => ({selectedVersion}))));

  }

}

