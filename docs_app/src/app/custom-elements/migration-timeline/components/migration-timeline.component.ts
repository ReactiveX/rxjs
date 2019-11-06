import {Component, Input, Output, ViewEncapsulation} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {filter, map, scan, shareReplay, withLatestFrom} from 'rxjs/operators';
import {VmMigrationList} from '../interfaces';
import {LocalState} from '../utils/local-state.service';

export interface IMigrationTimelineVM {
  migrationList?: VmMigrationList
  expandedRelease?: { [key: string]: boolean };
  selectedVersion?: string;
}

@Component({
  selector: `rxjs-migration-timeline`,
  template: `
    <mat-accordion
      *ngIf="expandedRelease$ | async as expandedRelease">

      <mat-expansion-panel
        class="migration-timeline"
        *ngFor="let release of migrationList$ | async"
        (click)="selectedVersionChange.next(release.version)"
        (click)="expandedReleaseChange.next(release.version)"
        [expanded]="expandedRelease[release.version]">
        <mat-expansion-panel-header
          class="release"
          [ngClass]="{'selected': expandedRelease[release.version]}">
          <mat-panel-title>
            <ng-container *ngIf="!expandedRelease[release.version]">{{release.version}}</ng-container>
            <ng-container *ngIf="expandedRelease[release.version]">{{release.title}}</ng-container>
          </mat-panel-title>
        </mat-expansion-panel-header>

        <ng-container *ngFor="let deprecation of release.deprecations">
          <mat-card class="migration-card ">
            <mat-card-header [id]="release.link">
              <mat-card-title>{{deprecation.title}}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>
                {{deprecation.reason}}
              </p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button>Breaking in {{deprecation.breakingVersion}}</button>
            </mat-card-actions>
          </mat-card>
        </ng-container>

      </mat-expansion-panel>

    </mat-accordion>`,
  styles: [`

  `],
  encapsulation: ViewEncapsulation.None
})
export class MigrationTimelineComponent extends LocalState<IMigrationTimelineVM> {

  @Input()
  set migrationList(migrationList: VmMigrationList) {
    if (migrationList) {
      this.setSlice({migrationList});
    }
  }

  selectedVersionInput = new Subject<string>();

  @Input()
  set selectedVersion(selectedVersion: string) {
    if (selectedVersion) {
      this.setSlice({selectedVersion});
    }
  }

  @Output()
  selectedVersionChange = new Subject<string>();

  expandedReleaseChange = new Subject<string>();

  migrationList$ = this.select(s => s.migrationList);
  selectedVersion$ = this.select(s => s.selectedVersion);
  expandedRelease$: Observable<{ [key: string]: boolean }> = merge(
    // A) Version selection click
    // If the user select's new version expand this panel
    this.selectedVersion$.pipe(map((version: string) => ({[version]: true}))),
    // B) Panel expansion click
    // If the panel requests a expansion change
    this.expandedReleaseChange.pipe(
      withLatestFrom(this.selectedVersion$),
      // If the user changes the selected version do nothing
      filter(([changedVersion, selectedVersion]) => changedVersion !== selectedVersion),
      // If the user clicks on a panel that is already the selected version
      // Get the changedVersion and
      map(([changedVersion]) => changedVersion),
      // Toggle it's state
      scan((s: { [key: string]: boolean }, v: string): { [key: string]: boolean } => ({[v]: !s[v]}), {})
    )
      .pipe(shareReplay(1))
  );

  constructor() {
    super();
  }

}


