import {Component, Input, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {filter, map, scan, withLatestFrom} from 'rxjs/operators';
import {ClientMigrationTimelineReleaseItem} from '../../data-access/migration-timeline.interface';
import {parseMigrationReleaseUID} from '../../utils/formatter-parser';

import {LocalState} from '../../utils/local-state.service';

export interface MigrationTimelineComponentViewBaseModel {
  releaseList: ClientMigrationTimelineReleaseItem[];
  selectedMigrationReleaseUID: string;
  selectedMigrationItemUID: string;
  expandedRelease: { [version: string]: boolean };
}

@Component({
  selector: `rxjs-migration-timeline`,
  template: `
    <mat-accordion *ngIf="vm$ | async as vm" class="migration-timeline">
      <mat-expansion-panel
        class="release"
        *ngFor="let release of vm.releaseList"
        [ngClass]="{'selected': vm.selectedMigrationReleaseUID === release.version}"
        (click)="selectedMigrationReleaseUIDChange
        .next(release.deprecations[0].migrationItemUID || release.breakingChanges[0].migrationItemUID)"
        [expanded]="(vm.selectedMigrationItemUID)[release.version]">
        <mat-expansion-panel-header class="header">
          <mat-panel-title
            class="migration-timeline-item-header-title"
            [id]="release.version">
            <div class="shield">
              <span class="label">github</span>
              <span class="version">{{release.version}}</span>
            </div>&nbsp;-&nbsp;{{release.date | date:'dd.MM.yyyy'}}&nbsp;-
            <ng-container *ngIf="(vm.expandedRelease)[release.version]">&nbsp;
              <mat-icon aria-hidden="false" aria-label="Deprecations">warning
              </mat-icon>&nbsp;Deprecations:&nbsp;{{release.deprecations.length}}&nbsp;
              <mat-icon aria-hidden="false" aria-label="Deprecations">error
              </mat-icon>&nbsp;BreakingChanges:&nbsp;{{release.breakingChanges.length}}
            </ng-container>
            <ng-container *ngIf="!(vm.expandedRelease)[release.version]">
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
            [ngClass]="{selected: vm.selectedMigrationItemUID === deprecation.migrationItemUID}">
            <mat-card-header [id]="deprecation.migrationItemSubjectUID" class="migration-headline">
              <mat-card-title>
                <code>{{deprecation.subject}}</code> is deprecated {{deprecation.deprecationMsgCode}}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <deprecation-description-table
                [deprecation]="deprecation"
                (selectedMigrationItemUIDChange)="selectedMigrationItemUIDChange.next($event)">
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
            [ngClass]="{selected: vm.selectedMigrationItemUID === breakingChange.migrationItemUID}">
            <mat-card-header [id]="breakingChange.migrationItemUID" class="migration-headline">
              <mat-card-title>{{breakingChange.breakingChangeMsg}}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <breaking-change-description-table
                [breakingChange]="breakingChange"
                (selectedMigrationItemUIDChange)="selectedMigrationItemUIDChange.next($event)">
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
    </mat-accordion>`
})
export class MigrationTimelineComponent extends LocalState<MigrationTimelineComponentViewBaseModel> {

  @Input()
  set releaseList(releaseList: ClientMigrationTimelineReleaseItem[]) {
    if (releaseList) {
      this.setSlice({releaseList});
    }
  }

  @Input()
  set selectedMigrationItemUID(selectedMigrationItemUID: string) {
    this.setSlice({
      selectedMigrationItemUID: selectedMigrationItemUID || '',
      selectedMigrationReleaseUID: parseMigrationReleaseUID(selectedMigrationItemUID)
    });
  }


  expandedReleaseChange = new Subject<string>();


  @Output()
  selectedMigrationItemUIDChange = new Subject<string>();

  @Output()
  selectedMigrationReleaseUIDChange = new Subject<string>();

  vm$ = this.select();

  constructor() {
    super();
    this.setSlice({expandedRelease: {}});

    // @TODO Rethink!!!!
    const _selectedMigrationItemUID$ = this.select('selectedMigrationItemUID');
    // A) Version selection click (nav bar of versions)
    // If the user select's a new version expand this panel
    this.connectSlice('expandedRelease', _selectedMigrationItemUID$
      .pipe(
        map((version: string) => ({[version]: true}))
      ),
    );
    // B) Panel expansion click
    // If the panel requests a expansion change
    this.connectSlice('expandedRelease', this.expandedReleaseChange
      .pipe(
        withLatestFrom(_selectedMigrationItemUID$),
        // If the user changes the currently selected version do nothing
        // This case is handled by the URL hash change
        filter(([changedVersion, selectedVersion]) => changedVersion !== selectedVersion),
        // If the user clicks on a panel that is already the selected version
        // Get the changedVersion and
        map(([changedVersion]) => changedVersion),
        // Toggle it's state
        scan((s: { [key: string]: boolean }, v: string): { [key: string]: boolean } => ({[v]: !s[v]}), {})
      )
    );

  }

}


