import { Component, Input, OnChanges } from '@angular/core';
import { NavigationNode } from 'app/navigation/navigation.model';

@Component({
  selector: 'aio-nav-item',
  template: `<div *ngIf="!node.children">
      <a href="{{ node.url }}" [ngClass]="classes" title="{{ node.tooltip }}" class="vertical-menu-item">
        {{ node.title }}
      </a>
    </div>

    <div *ngIf="node.children">
      <a
        *ngIf="node.url != null"
        href="{{ node.url }}"
        [ngClass]="classes"
        title="{{ node.tooltip }}"
        (click)="headerClicked()"
        class="vertical-menu-item heading"
      >
        {{ node.title }}
        <mat-icon class="rotating-icon" svgIcon="keyboard_arrow_right"></mat-icon>
      </a>

      <button
        *ngIf="node.url == null"
        type="button"
        [ngClass]="classes"
        title="{{ node.tooltip }}"
        (click)="headerClicked()"
        class="vertical-menu-item heading"
        [attr.aria-pressed]="isExpanded"
      >
        {{ node.title }}
        <mat-icon class="rotating-icon" svgIcon="keyboard_arrow_right"></mat-icon>
      </button>

      <div class="heading-children" [ngClass]="classes">
        <aio-nav-item
          *ngFor="let node of nodeChildren"
          [level]="level + 1"
          [isWide]="isWide"
          [isParentExpanded]="isExpanded"
          [node]="node"
          [selectedNodes]="selectedNodes"
        ></aio-nav-item>
      </div>
    </div>`,
})
export class NavItemComponent implements OnChanges {
  @Input() isWide = false;
  @Input() level = 1;
  @Input() node: NavigationNode;
  @Input() isParentExpanded = true;
  @Input() selectedNodes: NavigationNode[] | undefined;

  isExpanded = false;
  isSelected = false;
  classes: { [index: string]: boolean };
  nodeChildren: NavigationNode[];

  ngOnChanges() {
    this.nodeChildren = this.node && this.node.children ? this.node.children.filter((n) => !n.hidden) : [];

    if (this.selectedNodes) {
      const ix = this.selectedNodes.indexOf(this.node);
      this.isSelected = ix !== -1; // this node is the selected node or its ancestor
      this.isExpanded =
        this.isParentExpanded &&
        (this.isSelected || // expand if selected or ...
          // preserve expanded state when display is wide; collapse in mobile.
          (this.isWide && this.isExpanded));
    } else {
      this.isSelected = false;
    }

    this.setClasses();
  }

  setClasses() {
    this.classes = {
      ['level-' + this.level]: true,
      collapsed: !this.isExpanded,
      expanded: this.isExpanded,
      selected: this.isSelected,
    };
  }

  headerClicked() {
    this.isExpanded = !this.isExpanded;
    this.setClasses();
  }
}
