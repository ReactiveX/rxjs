import { Component, ElementRef, EventEmitter, HostListener, Input, Output, OnInit } from '@angular/core';

export interface Option {
  title: string;
  value?: any;
}

@Component({
  selector: 'aio-select',
  template: `<div class="form-select-menu">
    <button class="form-select-button" (click)="toggleOptions()">
      <strong>{{ label }}</strong
      ><span *ngIf="showSymbol" class="symbol {{ selected?.value }}"></span>{{ selected?.title }}
    </button>
    <ul class="form-select-dropdown" *ngIf="showOptions">
      <li
        *ngFor="let option of options; index as i"
        [class.selected]="option === selected"
        role="button"
        tabindex="0"
        (click)="select(option, i)"
        (keydown.enter)="select(option, i)"
        (keydown.space)="select(option, i); $event.preventDefault()"
      >
        <span *ngIf="showSymbol" class="symbol {{ option.value }}"></span>{{ option.title }}
      </li>
    </ul>
  </div>`,
})
export class SelectComponent implements OnInit {
  @Input()
  selected: Option;

  @Input()
  options: Option[];

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-native
  change = new EventEmitter<{ option: Option, index: number }>();

  @Input()
  showSymbol = false;

  @Input()
  label: string;

  showOptions = false;

  constructor(private hostElement: ElementRef) {}

  ngOnInit() {
    this.label = this.label || '';
  }

  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  hideOptions() {
    this.showOptions = false;
  }

  select(option: Option, index: number) {
    this.selected = option;
    this.change.emit({ option, index });
    this.hideOptions();
  }

  @HostListener('document:click', ['$event.target'])
  onClick(eventTarget: HTMLElement) {
    // Hide the options if we clicked outside the component
    if (!this.hostElement.nativeElement.contains(eventTarget)) {
      this.hideOptions();
    }
  }

  @HostListener('document:keydown.escape')
  onKeyDown() {
    this.hideOptions();
  }
}
