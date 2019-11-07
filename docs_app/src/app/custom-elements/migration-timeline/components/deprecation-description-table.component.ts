import {Component, Input} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {VmDeprecation} from '../interfaces';


@Component({
  selector: `deprecation-description-table`,
  template: `
    <table *ngIf="d$ | async as d">
      <thead>
      <tr>
        <th class="subject">
          <span class="symbol" [ngClass]="d.subjectApiSymbol"></span>
          <code>{{d.subject}}</code>
        </th>
        <th>
          {{d.breakingVersionText}}<a class="release-link" [href]="d.breakingLink">v{{d.breakingVersion}}</a>
          <div class="page-actions">
            <a [href]="d.sourceLink"
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
          <b>{{d.reasonTitle}}</b>
        </td>
        <td>
          <p>
            {{d.reason}}
          </p>
        </td>
      </tr>
      <tr>
        <td>
          <b>{{d.implicationTitle}}</b>
        </td>
        <td>
          <p>
            {{d.implication}}
          </p>
        </td>
      </tr>
      </tbody>
    </table>
  `
})
export class DeprecationDescriptionTableComponent {
  d$ = new ReplaySubject<VmDeprecation>(1);

  @Input()
  set deprecation(d: VmDeprecation) {
    if (d) {
      this.d$.next(d);
    }
  }
}


