import {Component, Input, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import {ClientMigrationTimelineReleaseItem, parseMigrationReleaseUIDFromString} from '../../data-access';
import {State} from '../../../../shared/state.service';

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

      <missing-information *ngIf="vm.selectedMigrationItemUID === 'wrong-uid'">
      </missing-information>

      <mat-expansion-panel
        class="release"
        *ngFor="let release of vm.releaseList"
        [ngClass]="{'selected': vm.selectedMigrationReleaseUID === release.version}"
        [expanded]="vm.expandedRelease[release.version]">
        <mat-expansion-panel-header class="header">
          <mat-panel-title
            class="migration-timeline-item-header-title"
            [id]="release.version">
            <div class="shield"
              (click)="selectedMigrationReleaseUIDChange.next(release.version)">
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
                (selectedMigrationItemUIDChange)="selectedMigrationReleaseUIDChange.next($event)">
              </deprecation-description-table>
              <code-example
                [dependencies]="{rxjs: '<' + release.version}"
                [language]="'typescript'"
                [title]="'Before Deprecation (< v' + release.version + ')'">
                {{deprecation.exampleBefore}}
              </code-example>
              <code-example
                [dependencies]="{rxjs: '>=' + release.version + ' <=' + deprecation.breakingChangeVersion}"
                [language]="'typescript'"
                [title]="'After Deprecation (>= v' + release.version + ')'">
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
                (selectedMigrationItemUIDChange)="selectedMigrationReleaseUIDChange.next($event)">
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

  constructor() {
    super();
    this.setState({expandedRelease: {}});

    const _selectedMigrationItemUID$ = this.select('selectedMigrationItemUID');

    this.connectState('expandedRelease', _selectedMigrationItemUID$
      .pipe(
        map((version: string) => ({[parseMigrationReleaseUIDFromString(version)]: true}))
      )
    );
  }
}
