import {Component} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {LocationService} from '../../shared/location.service';
import {ClientMigrationTimelineReleaseItem} from './data-access/migration-item';
import {parseMigrationReleaseUIDFromString} from './data-access/migration-timeline-struckture/migration-uid';
import {MigrationTimelineContainerAdapter} from './migration-timeline.container.adapter';

import {State} from './utils/state.service';

export interface MigrationTimelineContainerModelFromRemoteSources {
  releaseList: ClientMigrationTimelineReleaseItem[];
  selectedMigrationItemUID: string;
}

@Component({
  selector: `rxjs-migration-timeline-container`,
  template: `
    <h1>RxJS Migration Timeline</h1>
    <p>
      The migration timeline is here to support you in the following things:
    </p>
    <ul>
      <li>
        <input type="checkbox" checked disabled>
        Getting detailed explanation on why a deprecation happened. <br/>
        Elaborating the different between the deprecated version and the new version
      </li>
      <li>
        <input type="checkbox" checked disabled>
        Explaining the implications of a deprecation
      </li>
      <li>
        <input type="checkbox" checked disabled>
        Code examples of the deprecated and the new version
      </li>
      <li>
        <input type="checkbox" checked disabled>
        It provides a way to navigate trough all listed items
      </li>
      <li>
        <input type="checkbox" disabled>
        Manual Migration suggestions (optional)
      </li>
      <li>
        <input type="checkbox" disabled>
        Migration over tooling (optional)
      </li>
      <li>
        <input type="checkbox" checked disabled>
      </li>
    </ul>
    <h2>Supported Versions</h2>
    <ng-container *ngIf="baseModel$ | async as m">
      <section>
        <release-navigation
          [selectedMigrationReleaseUID]="(selectedMigrationReleaseUID$ | async)"
          [releaseList]="m.releaseList"
          (selectedMigrationReleaseUIDChange)="selectedMigrationReleaseUIDChange.next($event)">
        </release-navigation>
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
  providers: [State, MigrationTimelineContainerAdapter]
})
export class MigrationTimelineContainerComponent {

  // UI State
  // Normalized Model
  baseModel$: Observable<MigrationTimelineContainerModelFromRemoteSources> = this._baseModel.select();
  // Derivations from normalized model
  selectedMigrationReleaseUID$ = this._baseModel.select(
    map(s => parseMigrationReleaseUIDFromString(s.selectedMigrationItemUID)),
  );

  // UI Interactions
  selectedMigrationItemUIDChange = new Subject<string>();
  selectedMigrationReleaseUIDChange = new Subject<string>();

  constructor(
    private _baseModel: State<MigrationTimelineContainerModelFromRemoteSources>,
    private _locationService: LocationService,
    private _va: MigrationTimelineContainerAdapter
  ) {
    // connect data from remote sources to component state
    this._baseModel.connectState(this._va.select());

    // Routing
    this._baseModel.holdEffect(
      merge(
        this.selectedMigrationReleaseUIDChange,
        this.selectedMigrationItemUIDChange
      )
      .pipe(tap(uid => this.setMigrationTimelineSelection(uid)))
    );

  }

  private setMigrationTimelineSelection(uid: string) {
    const params = {uid: uid ? uid : undefined};
    this._locationService.setSearch('Migration Timeline', params);
  }

}

