import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Observable} from 'rxjs';
import {State} from '../../../../../shared/state.service';
import {Release} from '../../../data-access';

@Component({
  // tslint:disable-next-line:component-selector
  selector: `rxjs-preview`,
  template: `
    <ng-container *ngIf="release$ | async as release">
      <h3 class="migration-section-headline">
        <mat-icon [color]="'warn'"
          aria-hidden="false" aria-label="Deprecations">warning
        </mat-icon>
        {{release.deprecations.length}} Deprecations introduced on {{release.date | date:'dd.MM.yyyy'}} ( {{release.version}} )
      </h3>
      <mat-card
        *ngFor="let deprecation of release.deprecations"
        class="migration-section deprecation"
        [ngClass]="{selected: true}">
        <mat-card-header [id]="deprecation.migrationItemSubjectUID" class="migration-headline">
          <mat-card-title>
            <code>{{deprecation.subject}}</code> is deprecated {{deprecation.deprecationMsgCode}}
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <rxjs-deprecation-description-table
            [deprecation]="deprecation">
          </rxjs-deprecation-description-table>
          <rxjs-code-comparison
            *ngIf="deprecation.exampleBefore && deprecation.exampleAfter"
            [release]="release" [deprecation]="deprecation">
          </rxjs-code-comparison>
        </mat-card-content>
      </mat-card>

      <h3 class="migration-section-headline">
        <mat-icon [color]="'accent'" aria-hidden="false" aria-label="BreakingChange">error</mat-icon>
        Breaking changes introduced on {{release.date | date:'dd.MM.yyyy'}} ( {{release.version}} )
      </h3>
        <mat-card *ngFor="let breakingChange of release.breakingChanges"
          class="migration-section breakingChange"
          [ngClass]="{selected: false}">
          <mat-card-header [id]="breakingChange.migrationItemUID" class="migration-headline">
            <mat-card-title>{{breakingChange.breakingChangeMsg}}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <rxjs-breaking-change-description-table
              [breakingChange]="breakingChange">
            </rxjs-breaking-change-description-table>
          </mat-card-content>
        </mat-card>
    </ng-container>
  `,
  styles: [`
    .half {
      width: 50%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewComponent extends State<{ release: Release }> {

  @Input()
  set release(release$: Observable<Release>) {
    this.connect('release', release$);
  }

  release$: Observable<Release> = this.select('release');

  constructor() {
    super();
  }

}

