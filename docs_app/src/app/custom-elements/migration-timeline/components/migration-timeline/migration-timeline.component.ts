import {ChangeDetectionStrategy, Component, Input, Output} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import {State} from '../../../../shared/state.service';
import {ClientMigrationTimelineReleaseItem, parseMigrationReleaseUIDFromString} from '../../data-access';

export interface MigrationTimelineComponentViewBaseModel {
  releaseList: ClientMigrationTimelineReleaseItem[];
  selectedMigrationReleaseUID: string;
  selectedMigrationItemUID: string;
}

@Component({
  selector: `rxjs-migration-timeline`,
  template: `
    <mat-accordion *ngIf="vm$ | async as vm" class="migration-timeline">
      <missing-information *ngIf="vm.selectedMigrationItemUID === 'wrong-uid'">
      </missing-information>

      <mat-expansion-panel
        class="release"
        *ngFor="let release of vm.releaseList"
        [ngClass]="{'selected': vm.selectedMigrationReleaseUID === release.version}"
        [expanded]="(expandedRelease$ | async)[release.version]">
        <mat-expansion-panel-header class="header">
          <mat-panel-title
            class="migration-timeline-item-header-title"
            [id]="release.version">
               <shield [label]="'github'" [version]="release.version"
      (click)="selectedMigrationReleaseUIDChange.next(release.version)">
    </shield>&nbsp;-&nbsp;{{release.date | date:'dd.MM.yyyy'}}&nbsp;-
    <ng-container *ngIf="(expandedRelease$ | async)[release.version]">&nbsp;
      <mat-icon aria-hidden="false" aria-label="Deprecations">warning
      </mat-icon>&nbsp;Deprecations:&nbsp;{{release.deprecations.length}}&nbsp;
      <mat-icon aria-hidden="false" aria-label="Deprecations">error
      </mat-icon>&nbsp;BreakingChanges:&nbsp;{{release.breakingChanges.length}}
    </ng-container>
    <ng-container *ngIf="!(expandedRelease$ | async)[release.version]">
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
                (selectedMigrationItemUIDChange)="selectedMigrationReleaseUIDChange.next($event)">
              </deprecation-description-table>
              <code-examples
                [release]="release" [deprecation]="deprecation">
              </code-examples>
            </mat-card-content>
          </mat-card>
        </ng-container>
        <ng-template #emptyDeprecationList>
          <empty-migration-section>
            No Deprecations made in version {{release.version}}
          </empty-migration-section>
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
                (selectedMigrationItemUIDChange)="selectedMigrationReleaseUIDChange.next($event)">
              </breaking-change-description-table>
            </mat-card-content>
          </mat-card>
        </ng-container>
        <ng-template #emptyBreakingChangesList>
          <empty-migration-section>
            No BreakingChanges made in version {{release.version}}
          </empty-migration-section>
        </ng-template>
      </mat-expansion-panel>
    </mat-accordion>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MigrationTimelineComponent extends State<MigrationTimelineComponentViewBaseModel> {
  env = environment;

  @Input()
  set releaseList(releaseList: ClientMigrationTimelineReleaseItem[]) {
    if (releaseList) {
      this.setState({releaseList});
    }
  }

  @Input()
  set selectedMigrationItemUID(selectedMigrationItemUID: string) {
    this.setState({
      selectedMigrationItemUID: selectedMigrationItemUID || '',
      selectedMigrationReleaseUID: parseMigrationReleaseUIDFromString(selectedMigrationItemUID)
    });
  }

  @Output()
  selectedMigrationReleaseUIDChange = new Subject<string>();

  @Output()
  selectedMigrationItemUIDChange = new Subject<string>();

  vm$ = this.select();
  expandedRelease$: Observable<{ [version: string]: boolean }> = this.select('selectedMigrationItemUID')
    .pipe(
      map((version: string) => ({[parseMigrationReleaseUIDFromString(version)]: true})),
      startWith({})
    );

  constructor() {
    super();
  }
}
