import {ChangeDetectionStrategy, Component} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {LocationService} from '../../shared/location.service';
import {State} from '../../shared/state.service';
import {Release, parseMigrationReleaseUIDFromString} from './data-access';
import {MigrationTimelineContainerAdapter} from './migration-timeline.container.adapter';

export interface MigrationTimelineContainerModelFromRemoteSources {
  releaseList: Release[];
  selectedMigrationItemUID: string;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: `rxjs-migration-timeline-container`,
  template: `
    <h1>RxJS Migration Timeline</h1>
    <p>Small intro text here.</p>

    <h2>Supported Versions</h2>
    <ng-container *ngIf="baseModel$ | async as m">
      <section>
        <rxjs-release-navigation
          [selectedMigrationReleaseUID]="(selectedMigrationReleaseUID$ | async)"
          [releaseList]="m.releaseList"
          (selectedMigrationReleaseUIDChange)="selectedMigrationReleaseUIDChange.next($event)">
        </rxjs-release-navigation>
      </section>
      <h2>Timeline</h2>
      <section class="grid-fluid">
        <div class="release-group">
          <rxjs-migration-timeline
            [releaseList]="m.releaseList"
            [selectedMigrationItemUID]="m.selectedMigrationItemUID"
            (selectedMigrationItemUIDChange)="selectedMigrationItemUIDChange.next($event)"
            (selectedMigrationReleaseUIDChange)="selectedMigrationReleaseUIDChange.next($event)">
          </rxjs-migration-timeline>
        </div>
      </section>
    </ng-container>
  `,
  providers: [State, MigrationTimelineContainerAdapter],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MigrationTimelineContainerComponent {

  baseModel$: Observable<MigrationTimelineContainerModelFromRemoteSources> = this._baseModel.select();

  selectedMigrationReleaseUID$ = this._baseModel.select(
    map(s => parseMigrationReleaseUIDFromString(s.selectedMigrationItemUID)),
  );

  selectedMigrationItemUIDChange = new Subject<string>();
  selectedMigrationReleaseUIDChange = new Subject<string>();

  updateUrlSideEffect$ = merge(
    this.selectedMigrationReleaseUIDChange,
    this.selectedMigrationItemUIDChange
  )
    .pipe(tap(uid => this.setMigrationTimelineSelection(uid)));

  constructor(
    private _baseModel: State<MigrationTimelineContainerModelFromRemoteSources>,
    private _locationService: LocationService,
    private _va: MigrationTimelineContainerAdapter
  ) {
    this._baseModel.connect(this._va.select());
    this._baseModel.hold(this.updateUrlSideEffect$);
  }

  private setMigrationTimelineSelection(uid: string) {
    const params = {uid: uid ? uid : undefined};
    this._locationService.setSearch('Migration Timeline', params);
  }

}
