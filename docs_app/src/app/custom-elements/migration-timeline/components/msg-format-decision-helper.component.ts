import {Component} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {filter, map, shareReplay} from 'rxjs/operators';
import {SubjectSymbols} from '../data-access/migration-timeline-struckture/interfaces';
import {ClientMigrationTimelineReleaseItem} from '../data-access/migration-timeline.interface';
import {LocalState} from '../utils/local-state.service';


export const releaseList: ClientMigrationTimelineReleaseItem[] =
  [
    {
      version: '7.0.0-test.99',
      versionNumber: 70009799,
      officialRelease: true,
      date: new Date('2019-11-18'),
      deprecations: [
        {
          subject: 'never',
          subjectSymbol: SubjectSymbols.function,
          subjectAction: 'deprecated',
          sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L44',
          itemType: 'deprecation',
          migrationItemUID: '7.0.0-test.99_deprecation-never-function-deprecated',
          migrationReleaseUID: '7.0.0-test.99',
          migrationItemSubjectUID: 'deprecation-never-function-deprecated',
          opponentMigrationItemUID: '7.0.0-test.99_deprecation-never-function-never-removed',
          breakingChangeVersion: '7.0.0-test.99',
          breakingChangeSubjectAction: 'never-removed',
          deprecationMsgCode: 'Deprecated in favor of using {@link NEVER} constant',
          reason: 'Some meaningful reason',
          implication: '@!TODO',
          exampleBefore: '@TODO',
          exampleAfter: '@TODO'
        }
      ],
      breakingChanges: [
        {
          migrationItemUID: '7.0.0-test.99_breakingChange-never-function-removed',
          migrationReleaseUID: '7.0.0-test.99',
          migrationItemSubjectUID: 'breakingChange-never-function-deprecated',
          opponentMigrationItemUID: '7.0.0-test.99_deprecation-never-function-deprecated',
          subject: 'never',
          subjectSymbol: SubjectSymbols.function,
          subjectAction: 'removed',
          itemType: 'breakingChange',
          deprecationVersion: '7.0.0-test.99',
          deprecationSubjectAction: 'deprecated',
          breakingChangeMsg: 'Function never removed.'
        }
      ]
    }
  ];

@Component({
  selector: `msg-format-decision-helper`,
  template: `
    <form [formGroup]="form">
      <h3>Clarify message format for linter vs docs ( &#123;@link ... &#125; is not parsed in the linters message)</h3>
      <mat-form-field style="width: 100%;">
        <input matInput placeholder="Deprecation Message"
          [formControlName]="'deprecationMsgExample'">
      </mat-form-field>
    </form>
    <br/>

    <p>Examples:</p>
    <ul>
      <li>Deprecated in favor of using &#123;@link NEVER&#125; constant</li>
      <li>use the NEVER constant instead</li>
    </ul>

    <div class="row" *ngIf="(releaseList$  | async)[0].deprecations[0] as deprecation">
      <div class="col">
        <h3>Comments:</h3>
        <code>
          /** <br/>
          * <span style="color: indianred">@deprecated</span> {{deprecation.deprecationMsgCode}}<br/>
          * ...<br/>
          */<br/>
          export declare function  {{deprecation.subject}} &lt;T, R&gt;(...args: any): OperatorFunction &lt;T, R&gt;;
        </code>
      </div>
      <div class="col">
        <h3>Powershell :D</h3>
        <div style="color: white; background:darkblue; padding: 15px;">
          Error: .../source/operators/{{deprecation.subject}}ts:29:23 -  {{deprecation.subject}} is deprecated:
          {{deprecation.deprecationMsgCode}}
          - see http://localhost:4200/migration-timeline#7.0.0-test.00_deprecation-function-never-deprecated
        </div>
      </div>
      <div class="col">
        <h3>VSCode</h3>
        <div style="padding: 10px; background:black;">
          <div style="color: #bfcfdf; border: 1px solid #657b92;">
            (alisa) <span style="color: #8ba2ef">{{deprecation.subject}}():</span>
            Observable<{{deprecation.subject}}>
            <br/>
            <span style="color:#9e93c3">import</span> {{deprecation.subject}}
            <hr style="background: #657b92"/>
            never is deprecated: {{deprecation.deprecationMsgCode}} (deprecation) <span style="color: gray">tslint(1)</span>
            <hr style="background: #657b92"/>
            <span style="color: #3670cb">Peek Problem Quick Fix...</span>
          </div>
        </div>
      </div>
      <div class="col">
        <h3>Migration Timeline</h3>
        <rxjs-migration-timeline
          [releaseList]="releaseList$ | async"
          [selectedMigrationItemUID]="'7.0.0-test.99'">
        </rxjs-migration-timeline>
      </div>
      <div class="col">
        <h3>Docs:</h3>
        <header class="api-header">
          <h1 id="never">operatorName</h1>
          <label class="api-type-label function">function</label>
          <label class="api-status-label deprecated">deprecated</label>
        </header>
        <div class="api-body">
          <p class="short-description"></p>
          <section class="deprecated">
            <h2 id="deprecation-notes">Deprecation Notes</h2>
            <p *ngIf="docsMsg$ | async as msg">
              {{msg.start}}
              <a href="api/index/const/ + {{msg.link}}"><code>{{msg.link}}</code></a>
              {{msg.end}}
            </p>
          </section>
          <p>...</p>
          <h4 class="no-anchor">Parameters</h4>
          <p>There are no parameters.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .row {
      display: flex;
      flex-direction: column;
    }

    .row .col {
      padding: 15px;
      width: 100%;
      border-bottom: 1px solid gray;
    }
  `],
  preserveWhitespaces: true
})
export class MsgFormatDecisionHelperComponent
  extends LocalState<{
    releaseList: ClientMigrationTimelineReleaseItem[],
    docsMsg: { start: string, link: string, end: string },
    commentsMsg: string,
    linterMsg: string,
  }> {
  // Examples:
  // - Deprecated in favor of using {@link NEVER} constant.
  // - use the NEVER constant instead
  form = this.fb.group({deprecationMsgExample: ['']});

  releaseList$ = this.select(map(s => s.releaseList));
  docsMsg$ = this.releaseList$
    .pipe(map((l: ClientMigrationTimelineReleaseItem[]) => this.parseDocsMsg(l[0].deprecations[0].deprecationMsgCode)));

  constructor(private fb: FormBuilder) {
    super();

    const msg$ = this.form.controls.deprecationMsgExample.valueChanges.pipe(shareReplay());


    this.connectSlice(msg$
      .pipe(filter(v => !!v), map(v => {
        releaseList[0].deprecations[0].deprecationMsgCode = v;
        return {releaseList: releaseList};
      }))
    );

    this.connectSlice(msg$
      .pipe(map(v => ({commentsMsg: this.parseCommentsMsg(v)})))
    );
    this.connectSlice(msg$
      .pipe(map(v => ({linterMsg: this.parseLinterMsg(v)})))
    );
  }

  ngOnInit() {
    this.form.patchValue({deprecationMsgExample: 'Deprecated in favor of using {@link NEVER} constant'});
  }

  parseCommentsMsg(msg: string): string {
    return msg;
  }

  parseDocsMsg(msg: string): { start: string, link: string, end: string } {
    const a = msg.split('{@link');
    let start = msg;
    let link, end = '';
    if (a.length > 1) {
      start = a[0].trim();
      const a2 = a[1].split('}').map(v => v.trim());
      link = a2[0];
      end = a2[1];
    }
    return {start, link, end};
  }

  parseLinterMsg(msg) {
    const humanReadableShortMessage = msg;
    const linkToDeprecationPage = msg.linkName;
    return `${humanReadableShortMessage} - see ${linkToDeprecationPage}`;
  }

  parseMigrationTimelineMsg(msg) {
    const humanReadableShortMessage = msg;
    const linkToDeprecationPage = msg.linkName;
    return `${humanReadableShortMessage} - see ${linkToDeprecationPage}`;
  }

}


