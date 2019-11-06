import {Component, ViewEncapsulation} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {VmMigrationList, VmReleaseNavigationItem} from './interfaces';
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
    <div class="flex-center group-buttons">
      <mat-chip-list>
        <mat-chip
          *ngFor="let option of releaseNavigation$ | async"
          [selected]="(selectedVersion$ | async) === option.version"
          (click)="selectedVersionChange$.next(option.version)">{{option.version}}</mat-chip>
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
  extends LocalState<{ selectedVersion: string }> {

  initFocusedVersion = '6.5.1';

  selectedVersionChange$ = new Subject<string>();
  selectedVersion$ = this.selectedVersionChange$.pipe(distinctUntilChanged(), startWith(this.initFocusedVersion));
  releaseNavigation$: Observable<VmReleaseNavigationItem[]> = this.mtlService.migrations$
    .pipe(map(parseVmReleaseNavigation));
  migrationList$: Observable<VmMigrationList> = this.mtlService.migrations$
    .pipe(map(parseVmMigrationList));

  constructor(public mtlService: MigrationTimelineService) {
    super();

    this.mtlService.fetchMigrationTimeline();
  }

}

