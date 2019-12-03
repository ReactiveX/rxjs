import {Component, Input} from '@angular/core';
import {combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {VmDeprecation} from '../../migration-timeline.interface';
import {parseMigrationItemUID} from '../../utils/formatter-parser';
import {LocalState} from '../../utils/local-state.service';


@Component({
  selector: `deprecation-description-table`,
  template: `
    <table *ngIf="vm$ | async as vm">
      <thead>
      <tr>
        <th class="subject">
          <span class="symbol" [ngClass]="vm.deprecation.subjectApiSymbol"></span>
          <code>{{vm.deprecation.subject}}</code>
        </th>
        <th>
          Breaking change in version&nbsp;
          <a class="release-link"
            [href]="breakingChangeLink$ | async">
            v{{vm.deprecation.breakingVersion}}
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
  deprecation: VmDeprecation;
  baseURL: string;
}> {
  vm$ = this.select();
  deprecation$ = this.select('deprecation');
  baseURL$ = this.select('baseURL');
  breakingChangeLink$ = combineLatest(this.deprecation$, this.baseURL$)
    .pipe(
      map(([d, url]) => url + '#' + parseMigrationItemUID(d, {
        itemType: 'breakingChange',
        version: d.breakingVersion,
        subjectAction: d.breakingSubjectAction,
        subject: d.subject
      }))
    );

  @Input()
  set deprecation(deprecation: VmDeprecation) {
    if (deprecation) {
      this.setSlice({deprecation});
    }
  }

  @Input()
  set baseURL(baseURL: string) {
    if (baseURL) {
      this.setSlice({baseURL});
    }
  }
}


