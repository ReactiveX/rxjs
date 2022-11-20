import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { asapScheduler as asap, combineLatest, Subject } from 'rxjs';
import { startWith, subscribeOn, takeUntil } from 'rxjs/operators';

import { ScrollService } from 'app/shared/scroll.service';
import { TocItem, TocService } from 'app/shared/toc.service';

type TocType = 'None' | 'Floating' | 'EmbeddedSimple' | 'EmbeddedExpandable';

@Component({
  selector: 'aio-toc',
  template: `<div *ngIf="type !== 'None'" class="toc-inner no-print" [class.collapsed]="isCollapsed">
    <div *ngIf="type === 'EmbeddedSimple'" class="toc-heading embedded">Contents</div>

    <button
      *ngIf="type === 'EmbeddedExpandable'"
      type="button"
      (click)="toggle(false)"
      class="toc-heading embedded secondary"
      title="Expand/collapse contents"
      aria-label="Expand/collapse contents"
      [attr.aria-pressed]="!isCollapsed"
    >
      Contents
      <mat-icon class="rotating-icon" svgIcon="keyboard_arrow_right" [class.collapsed]="isCollapsed"></mat-icon>
    </button>

    <ul class="toc-list" [class.embedded]="type !== 'Floating'">
      <ng-container *ngFor="let toc of tocList; let i = index">
        <li
          #tocItem
          title="{{ toc.title }}"
          *ngIf="type === 'Floating' || toc.level !== 'h1'"
          class="{{ toc.level }}"
          [class.secondary]="type === 'EmbeddedExpandable' && i >= primaryMax"
          [class.active]="i === activeIndex"
        >
          <a [href]="toc.href" [innerHTML]="toc.content"></a>
        </li>
      </ng-container>
    </ul>

    <button
      *ngIf="type === 'EmbeddedExpandable'"
      type="button"
      (click)="toggle()"
      class="toc-more-items embedded material-icons"
      [class.collapsed]="isCollapsed"
      title="Expand/collapse contents"
      aria-label="Expand/collapse contents"
      [attr.aria-pressed]="!isCollapsed"
    ></button>
  </div> `,
  styles: [],
})
export class TocComponent implements OnInit, AfterViewInit, OnDestroy {
  activeIndex: number | null = null;
  type: TocType = 'None';
  isCollapsed = true;
  isEmbedded = false;
  @ViewChildren('tocItem') private items: QueryList<ElementRef>;
  private onDestroy = new Subject();
  primaryMax = 4;
  tocList: TocItem[];

  constructor(private scrollService: ScrollService, elementRef: ElementRef, private tocService: TocService) {
    this.isEmbedded = elementRef.nativeElement.className.indexOf('embedded') !== -1;
  }

  ngOnInit() {
    this.tocService.tocList.pipe(takeUntil(this.onDestroy)).subscribe((tocList) => {
      this.tocList = tocList;
      const itemCount = count(this.tocList, (item) => item.level !== 'h1');

      this.type =
        itemCount > 0 ? (this.isEmbedded ? (itemCount > this.primaryMax ? 'EmbeddedExpandable' : 'EmbeddedSimple') : 'Floating') : 'None';
    });
  }

  ngAfterViewInit() {
    if (!this.isEmbedded) {
      // We use the `asap` scheduler because updates to `activeItemIndex` are triggered by DOM changes,
      // which, in turn, are caused by the rendering that happened due to a ChangeDetection.
      // Without asap, we would be updating the model while still in a ChangeDetection handler, which is disallowed by Angular.
      combineLatest(this.tocService.activeItemIndex.pipe(subscribeOn(asap)), this.items.changes.pipe(startWith(this.items)))
        .pipe(takeUntil(this.onDestroy))
        .subscribe(([index, items]) => {
          this.activeIndex = index;
          if (index === null || index >= items.length) {
            return;
          }

          const e = items.toArray()[index].nativeElement;
          const p = e.offsetParent;

          const eRect = e.getBoundingClientRect();
          const pRect = p.getBoundingClientRect();

          const isInViewport = eRect.top >= pRect.top && eRect.bottom <= pRect.bottom;

          if (!isInViewport) {
            p.scrollTop += eRect.top - pRect.top - p.clientHeight / 2;
          }
        });
    }
  }

  ngOnDestroy() {
    this.onDestroy.next(null);
  }

  toggle(canScroll = true) {
    this.isCollapsed = !this.isCollapsed;
    if (canScroll && this.isCollapsed) {
      this.toTop();
    }
  }

  toTop() {
    this.scrollService.scrollToTop();
  }
}

function count<T>(array: T[], fn: (item: T) => boolean) {
  return array.reduce((result, item) => (fn(item) ? result + 1 : result), 0);
}
