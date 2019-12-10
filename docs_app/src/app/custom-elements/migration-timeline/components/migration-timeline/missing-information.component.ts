import {Component} from '@angular/core';

@Component({
  selector: `missing-information`,
  template: `
    <mat-card class="migration-section manual-step selected suggestion-open-issue">
      <mat-card-header id="wrong-uid" class="migration-headline">
        <mat-card-title>Migration Information Missing</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>
          Go to RxJS GitHub page and
          <a href="https://github.com/ReactiveX/rxjs/issues/new?template=documentation.md" target="_blank"> open an issue</a>
        </p>
        <mat-icon aria-hidden="false" aria-label="Missing Documentation">error_outline</mat-icon>
      </mat-card-content>
    </mat-card>
  `
})
export class MissingInformationComponent {
}


