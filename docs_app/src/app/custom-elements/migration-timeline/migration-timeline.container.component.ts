import {Component} from '@angular/core';
import {combineLatest} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MigrationTimelineContainerAdapter} from './migration-timeline.container.adapter';
import {baseURL} from './migration-timeline.module';
import {formatSemVerNumber} from './utils/formatter-parser';

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
        <input type="checkbox" disabled>
        Manual Migration suggestions (optional)
      </li>
      <li>
        <input type="checkbox" disabled>
        Migration over tooling (optional)
      </li>
      <li>
        <input type="checkbox" disabled>
        If deprecation information does not exist suggest to open an issue.
        - Implement Link to docs issue template
        - Update Docs Issue template with new option for deprecation message
      </li>
    </ul>
    <h2>Supported Versions</h2>
    <ng-container *ngIf="va.m$ | async as m">
      <section>
        {{m.filter}}<br>
        {{m.releaseNavigation}}
        <filter-form
          [releaseList]="m.releaseNavigation"
          (filterChange)="va.setSlice({filter: $event})">
        </filter-form>
      </section>
      <section>
        <release-navigation
          [baseURL]="baseURL"
          [selectedMigrationReleaseUID]="m.selectedMigrationReleaseUID"
          [releaseList]="m.releaseList"
          (selectedMigrationReleaseUIDChange)="selectedMigrationReleaseUIDChange.next($event)">
        </release-navigation>
      </section>
      <h2>Timeline</h2>
      <section class="grid-fluid">
        <div class="release-group">
          <rxjs-migration-timeline
            [baseURL]="baseURL"
            [releaseList]="m.releaseList"
            [selectedMigrationReleaseUID]="m.selectedMigrationReleaseUID"
            [selectedMigrationItemSubjectUID]="m.selectedMigrationItemSubjectUID"
            (selectedMigrationReleaseUIDChange)="selectedMigrationReleaseUIDChange.next($event)">
          </rxjs-migration-timeline>
        </div>
      </section>
    </ng-container>

    <msg-format-decision-helper></msg-format-decision-helper>
  `,
  providers: [MigrationTimelineContainerAdapter]
})
export class MigrationTimelineContainerComponent {
  baseURL = baseURL;

  // derivations from view model
  filteredReleaseNavigation$ = combineLatest(
    this.va.select('filter').pipe(startWith({from: '', to: ''})),
    this.va.select('releaseList')
  )
    .pipe(
      map(([filterCfg, list]) => {
        return list.filter(r => {
          return r.versionNumber >= formatSemVerNumber(filterCfg.from);
        });
      })
    );
  // UI interactions
  selectedMigrationReleaseUIDChange = this.va.selectedMigrationReleaseUIDChangeConnector;

  constructor(private va: MigrationTimelineContainerAdapter) {

  }

}

