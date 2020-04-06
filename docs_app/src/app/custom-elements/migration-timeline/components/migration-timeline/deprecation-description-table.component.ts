import {ChangeDetectionStrategy, Component, Input, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {Deprecation} from '../../data-access';

@Component({
  selector: `rxjs-deprecation-description-table`,
  template: `
    <table>
      <thead>
      <tr>
        <th class="subject">
          <span class="symbol" [ngClass]="deprecationVal.subjectSymbol"></span>
          <code>{{deprecationVal.subject}}</code>
        </th>
        <th>
          Breaking change in version&nbsp;
          <a class="release-link"
            (click)="selectedMigrationItemUIDChange.next(deprecationVal.opponentMigrationItemUID)">
            v{{deprecationVal.breakingChangeVersion}}
          </a>
          <div class="page-actions">
            <a [href]="deprecationVal.sourceLink"
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
        <td><b>Reason</b></td>
        <td><p>{{deprecationVal.reason}}</p></td>
      </tr>
      <tr>
        <td><b>Implication</b></td>
        <td><p>{{deprecationVal.implication}}</p></td>
      </tr>
      </tbody>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeprecationDescriptionTableComponent {
  deprecationVal: Deprecation;

  @Input()
  set deprecation(deprecation: Deprecation) {
    if (deprecation) {
      this.deprecationVal = deprecation;
    }
  }

  @Output()
  selectedMigrationItemUIDChange = new Subject<string>();
}


