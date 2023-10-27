import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentLocationComponent } from './current-location.component.js';
import { WithCustomElementComponent } from '../element-registry.js';

@NgModule({
  imports: [CommonModule],
  declarations: [CurrentLocationComponent],
})
export class CurrentLocationModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = CurrentLocationComponent;
}
