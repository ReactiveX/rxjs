import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Deprecation, Release} from '../../data-access';

@Component({
  selector: `code-examples`,
  template: `
    <code-example
      [dependencies]="{rxjs: '<' + _release.version}"
      [language]="'typescript'"
      [title]="'Before Deprecation (< v' + _release.version + ')'">
      {{_deprecation.exampleBefore}}
    </code-example>
    <code-example
      [dependencies]="{rxjs: '>=' + _release.version + ' <=' + _deprecation.breakingChangeVersion}"
      [language]="'typescript'"
      [title]="'After Deprecation (>= v' + _release.version + ')'">
      {{_deprecation.exampleAfter}}
    </code-example>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeExamplesComponent {

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
