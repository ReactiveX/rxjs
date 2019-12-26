import {Component, Input, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {ClientDeprecation} from '../../data-access/migration-timeline.interface';
import {LocalState} from '../../utils/local-state.service';
import {disposeEvent} from '../../utils/operators';


@Component({
  selector: `deprecation-description-table`,
  template: `
    <table *ngIf="vm$ | async as vm">
      <thead>
      <tr>
        <th class="subject">
          <span class="symbol" [ngClass]="vm.deprecation.subjectSymbol"></span>
          <code>{{vm.deprecation.subject}}</code>
        </th>
        <th>
          Breaking change in version&nbsp;
          <a class="release-link"
            (click)="selectedMigrationItemUIDChange.next(vm.deprecation.opponentMigrationItemUID)">
            v{{vm.deprecation.breakingChangeVersion}}
          </a>
          <div class="page-actions">
            <a [href]="vm.deprecation.sourceLink"
              aria-label="View Source"
              title="View Source">
              <i class="material-icons" aria-hidden="true" role="img">code</i>
            </a>
          </div>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>
          <b>Reason</b>
        </td>
        <td>
          <p>
            {{vm.deprecation.reason}}
          </p>
        </td>
      </tr>
      <tr>
        <td>
          <b>Implication</b>
        </td>
        <td>
          <p>
            {{vm.deprecation.implication}}
          </p>
        </td>
      </tr>
      </tbody>
    </table>
  `
})
export class DeprecationDescriptionTableComponent extends LocalState<{
  deprecation: ClientDeprecation;
}> {
  vm$ = this.select();

  disposeEvent = disposeEvent;
  @Input()
  set deprecation(deprecation: ClientDeprecation) {
    if (deprecation) {
      this.setSlice({deprecation});
    }
  }

  @Output()
  selectedMigrationItemUIDChange = new Subject<string>();

}


