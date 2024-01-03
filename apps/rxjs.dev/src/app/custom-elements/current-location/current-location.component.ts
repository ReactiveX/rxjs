/* tslint:disable component-selector */
import { Component } from '@angular/core';
import { LocationService } from 'app/shared/location.service';

/** Renders the current location path. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'current-location',
  template: '{{ location.currentPath | async }}'
})
export class CurrentLocationComponent {
  constructor(public location: LocationService) { }
}
