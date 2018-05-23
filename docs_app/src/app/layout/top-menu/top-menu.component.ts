import {Component, Input} from '@angular/core';
import {NavigationNode} from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-top-menu',
  template: `
    <ul role="navigation">
      <li *ngFor="let node of nodes"><a class="nav-link" [href]="node.url" [title]="node.title">{{ node.title }}</a>
      </li>
    </ul>
    <div style="text-align: right; width: 100%; font-weight: bold; color: rgba(255,255,255, 1);">
      <span>WARNING: This is BETA site</span>
    </div>
  `
})
export class TopMenuComponent {
  @Input() nodes: NavigationNode[];

}
