import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmbeddedStackblitzComponent, LiveExampleComponent } from './live-example.component.js';
import { WithCustomElementComponent } from '../element-registry.js';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ LiveExampleComponent, EmbeddedStackblitzComponent ],
  entryComponents: [ LiveExampleComponent ]
})
export class LiveExampleModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = LiveExampleComponent;
}
