import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Deprecation, Release} from '../../data-access';

@Component({
  selector: `rxjs-code-comparison`,
  template: `
    <code-example
      [dependencies]="{rxjs: '<' + _release.version}"
      [language]="'typescript'"
      [header]="'Before Deprecation (< v' + _release.version + ')'">
      {{_deprecation.exampleBefore}}
    </code-example>
    <code-example
      [dependencies]="{rxjs: '>=' + _release.version + ' <=' + _deprecation.breakingChangeVersion}"
      [language]="'typescript'"
      [header]="'After Deprecation (>= v' + _release.version + ')'">
      {{_deprecation.exampleAfter}}
    </code-example>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeComparisonComponent {

  _release: Release;
  @Input()
  set release(release: Release) {
    if (release) {
      this._release = release;
    }
  }

  _deprecation: Deprecation;
  @Input()
  set deprecation(deprecation: Deprecation) {
    if (deprecation) {
      this._deprecation = deprecation;
    }
  }

}
