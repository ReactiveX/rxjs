import {Component, Input, Output} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {filter, map, scan, shareReplay, withLatestFrom} from 'rxjs/operators';
import {VmReleaseListItem} from '../../migration-timeline.interface';
import {baseURL} from '../../migration-timeline.module';
import {LocalState} from '../../utils/local-state.service';

export interface VmMigrationTimeline {
  releaseList: VmReleaseListItem[]
  expandedRelease: { [key: string]: boolean };
  selectedVersion: string;
  itemSubId: string;
}

@Component({
  selector: `rxjs-migration-timeline`,
  template: `
    <mat-accordion *ngIf="releaseList$ | async as releaseList" class="migration-timeline">
      <ng-container *ngIf="expandedRelease$ | async as expandedRelease">
        <mat-expansion-panel
          class="release"
          [ngClass]="{'selected': (selectedVersion$ | async) === release.version}"
          *ngFor="let release of releaseList"
          (click)="selectedVersionChange.next(release.version)"
          (click)="expandedReleaseChange.next(release.version)"
          [expanded]="expandedRelease[release.version]">
          <mat-expansion-panel-header class="header">
            <mat-panel-title
              class="migration-timeline-item-header-title"
              [id]="release.version">
              <div class="shield">
                <span class="label">github</span>
                <span class="version">{{release.version}}</span>
              </div>&nbsp;-&nbsp;{{release.date | date:'dd.MM.yyyy'}}&nbsp;-
              <ng-container *ngIf="expandedRelease[release.version]">&nbsp;
                <mat-icon aria-hidden="false" aria-label="Deprecations">warning
                </mat-icon>&nbsp;Deprecations:&nbsp;{{release.deprecations.length}}&nbsp;
                <mat-icon aria-hidden="false" aria-label="Deprecations">error
                </mat-icon>&nbsp;BreakingChanges:&nbsp;{{release.breakingChanges.length}}
              </ng-container>
              <ng-container *ngIf="!expandedRelease[release.version]">
                <mat-icon *ngIf="release.deprecations.length" aria-hidden="false" aria-label="Deprecations">warning
                </mat-icon>&nbsp;
                <span *ngIf="release.deprecations.length">{{release.deprecations.length}}</span>
                <mat-icon *ngIf="release.breakingChanges.length" aria-hidden="false" aria-label="BreakingChange">error
                </mat-icon>
                &nbsp;
                <span *ngIf="release.breakingChanges.length">{{release.breakingChanges.length}}</span>&nbsp;
              </ng-container>
            </mat-panel-title>
          </mat-expansion-panel-header>

          <h3 class="migration-section-headline">
            <mat-icon [color]="'warn'"
              aria-hidden="false" aria-label="Deprecations">warning
            </mat-icon>
            {{release.deprecations.length}} Deprecations introduced on {{release.date | date:'dd.MM.yyyy'}} ( {{release.version}} )
          </h3>

          <ng-container *ngIf="release.deprecations.length > 0; else emptyDeprecationList">
            <mat-card
              *ngFor="let deprecation of release.deprecations"
              class="migration-section deprecation"
              [ngClass]="{selected: (itemSubId$ | async) === (deprecation | timelineItemSubId: {})}">
              <mat-card-header [id]="deprecation | timelineItemLink:{ version: release.version}" class="migration-headline">
                <mat-card-title>
                  {{deprecation.deprecationMsgCode}}
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <deprecation-description-table
                  [baseURL]="baseURL"
                  [deprecation]="deprecation">
                </deprecation-description-table>
                <code-example [language]="'typescript'" [title]="'Before Deprecation (< v' + release.version + ')'">
                  {{deprecation.exampleBefore}}
                </code-example>
                <code-example [language]="'typescript'" [title]="'After Deprecation (>= v' + release.version+ ')'">
                  {{deprecation.exampleAfter}}
                </code-example>
              </mat-card-content>
            </mat-card>
          </ng-container>

          <ng-template #emptyDeprecationList>
            <mat-card class="migration-section empty">
              <mat-card-header [id]="release.version" class="migration-headline">
                <mat-card-title>
                  No Deprecations made in version {{release.version}}
                </mat-card-title>
              </mat-card-header>
            </mat-card>
          </ng-template>

          <h3 class="migration-section-headline">
            <mat-icon [color]="'accent'" aria-hidden="false" aria-label="BreakingChange">error</mat-icon>
            Breaking changes introduced on {{release.date | date:'dd.MM.yyyy'}} ( {{release.version}} )
          </h3>
          <ng-container *ngIf="release.breakingChanges.length > 0; else emptyBreakingChangesList">
            <mat-card *ngFor="let breakingChange of release.breakingChanges"
              class="migration-section breakingChange"
              [ngClass]="{selected: (itemSubId$ | async) === (breakingChange | timelineItemSubId: {})}">
              <mat-card-header [id]="breakingChange | timelineItemLink:{ version: release.version}" class="migration-headline">
                <mat-card-title>
                  {{breakingChange.breakingChangeMsgCode}}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <breaking-change-description-table
                  [baseURL]="baseURL"
                  [breakingChange]="breakingChange">
                </breaking-change-description-table>
              </mat-card-content>
            </mat-card>
          </ng-container>
          <ng-template #emptyBreakingChangesList>
            <mat-card class="migration-section empty">
              <mat-card-header [id]="release.version" class="migration-headline">
                <mat-card-title>
                  No BreakingChanges made in version {{release.version}}
                </mat-card-title>
              </mat-card-header>
            </mat-card>
          </ng-template>

        </mat-expansion-panel>

      </ng-container>
    </mat-accordion>`
})
export class MigrationTimelineComponent extends LocalState<VmMigrationTimeline> {
  baseURL = baseURL;

  @Input()
  set releaseList(releaseList: VmReleaseListItem[]) {
    if (releaseList) {
      this.setSlice({releaseList});
    }
  }

  @Input()
  set selectedVersion(selectedVersion: string) {
    if (selectedVersion) {
      this.setSlice({selectedVersion});
    }
  }

  @Input()
  set itemSubId(itemSubId: string) {
    if (itemSubId) {
      this.setSlice({itemSubId});
    }
  }

  @Output()
  selectedVersionChange = new Subject<string>();

  expandedReleaseChange = new Subject<string>();

  releaseList$ = this.select(map(s => s.releaseList));
  selectedVersion$ = this.select(map(s => s.selectedVersion));
  itemSubId$ = this.select(map(s => s.itemSubId));

  // @TODO Rethink after routing is done clean
  expandedRelease$: Observable<{ [key: string]: boolean }> = merge(
    // A) Version selection click (nav bar of versions)
    // If the user select's a new version expand this panel
    this.selectedVersion$.pipe(map((version: string) => ({[version]: true}))),
    // B) Panel expansion click
    // If the panel requests a expansion change
    this.expandedReleaseChange.pipe(
      withLatestFrom(this.selectedVersion$),
      // If the user changes the currently selected version do nothing
      // This case is handled by the URL hash change
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


