import {Component} from '@angular/core';
import {map} from 'rxjs/operators';
import {LocationService} from '../../../../shared/location.service';
import {parseMigrationItemUIDObject, parseMigrationItemUIDURL} from '../../utils/formatter-parser';

@Component({
  selector: `missing-information`,
  template: `
    <mat-card class="migration-section manual-step selected suggestion-open-issue">
      <mat-card-header id="wrong-uid" class="migration-headline">
        <mat-card-title>Migration information is missing!</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>
          We suggest you go to the RxJS GitHub page and
          <a [href]="link$ | async" target="_blank"> open an issue</a>
        </p>
        <mat-icon aria-hidden="false" aria-label="Missing Documentation">error_outline</mat-icon>
      </mat-card-content>
    </mat-card>
  `
})
export class MissingInformationComponent {

  link$ = this.lo.currentSearchParams
    .pipe(
      map(p => {
        const o = parseMigrationItemUIDObject(p.uid);
        const s = parseMigrationItemUIDURL(p.uid);
        return `https://github.com/ReactiveX/rxjs/issues/new?
title=[docs] Missing ${o.itemType} information for ${o.subject} in version ${o.version}&
body=The ID ${s} is not linked to any item of the migration timeline.\n Please insert the information.&
template=documentation.md`;
      })
    );

  constructor(private lo: LocationService) {

  }

}


