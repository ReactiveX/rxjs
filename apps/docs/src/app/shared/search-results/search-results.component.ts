import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { SearchResult, SearchResults, SearchArea } from 'app/search/interfaces';

/**
 * A component to display search results in groups
 */
@Component({
  selector: 'aio-search-results',
  template: `<div class="search-results">
      <div *ngIf="searchAreas.length; then searchResults; else notFound"></div>
    </div>

    <ng-template #searchResults>
      <h2 class="visually-hidden">Search Results</h2>
      <div class="search-area" *ngFor="let area of searchAreas">
        <h3>{{ area.name }} ({{ area.pages.length + area.priorityPages.length }})</h3>
        <ul class="priority-pages">
          <li class="search-page" *ngFor="let page of area.priorityPages">
            <a class="search-result-item" href="{{ page.path }}" (click)="onResultSelected(page, $event)">
              <span class="symbol {{ page.type }}" *ngIf="area.name === 'api'"></span>{{ page.title }}
            </a>
          </li>
        </ul>
        <ul>
          <li class="search-page" *ngFor="let page of area.pages">
            <a class="search-result-item" href="{{ page.path }}" (click)="onResultSelected(page, $event)">
              <span class="symbol {{ page.type }}" *ngIf="area.name === 'api'"></span>{{ page.title }}
            </a>
          </li>
        </ul>
      </div>
    </ng-template>

    <ng-template #notFound>
      <p>{{ notFoundMessage }}</p>
    </ng-template>`,
})
export class SearchResultsComponent implements OnChanges {
  /**
   * The results to display
   */
  @Input()
  searchResults: SearchResults | null;

  /**
   * Emitted when the user selects a search result
   */
  @Output()
  resultSelected = new EventEmitter<SearchResult>();

  readonly defaultArea = 'other';
  notFoundMessage = 'Searching ...';
  readonly topLevelFolders = ['guide', 'tutorial'];
  searchAreas: SearchArea[] = [];

  ngOnChanges() {
    this.searchAreas = this.searchResults ? this.processSearchResults(this.searchResults) : [];
  }

  onResultSelected(page: SearchResult, event: MouseEvent) {
    // Emit a `resultSelected` event if the result is to be displayed on this page.
    if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
      this.resultSelected.emit(page);
    }
  }

  // Map the search results into groups by area
  private processSearchResults(search: SearchResults) {
    if (!search) {
      return [];
    }
    this.notFoundMessage = 'No results found.';
    const searchAreaMap: { [key: string]: SearchResult[] } = {};
    search.results.forEach((result) => {
      if (!result.title) {
        return;
      } // bad data; should fix
      const areaName = this.computeAreaName(result) || this.defaultArea;
      const area = (searchAreaMap[areaName] = searchAreaMap[areaName] || []);
      area.push(result);
    });
    const keys = Object.keys(searchAreaMap).sort((l, r) => (l > r ? 1 : -1));
    return keys.map((name) => {
      let pages: SearchResult[] = searchAreaMap[name];

      // Extract the top 5 most relevant results as priorityPages
      const priorityPages = pages.splice(0, 5);
      pages = pages.sort(compareResults);
      return { name, pages, priorityPages };
    });
  }

  // Split the search result path and use the top level folder, if there is one, as the area name.
  private computeAreaName(result: SearchResult) {
    if (this.topLevelFolders.indexOf(result.path) !== -1) {
      return result.path;
    }
    const [areaName, rest] = result.path.split('/', 2);
    return rest && areaName;
  }
}

function compareResults(l: SearchResult, r: SearchResult) {
  return l.title.toUpperCase() > r.title.toUpperCase() ? 1 : -1;
}
