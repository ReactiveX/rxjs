import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WithCustomElementComponent } from '../element-registry.js';
import { TocComponent } from './toc.component.js';

@NgModule({
  imports: [ CommonModule, MatIconModule ],
  declarations: [ TocComponent ],
  entryComponents: [ TocComponent ],
})
export class TocModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = TocComponent;
}
