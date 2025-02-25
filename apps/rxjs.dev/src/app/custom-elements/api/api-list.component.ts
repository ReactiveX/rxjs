/*
 * API List & Filter Component
 *
 * A page that displays a formatted list of the public Angular API entities.
 * Clicking on a list item triggers navigation to the corresponding API entity document.
 * Can add/remove API entity links based on filter settings.
 */

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { combineLatest, Observable, ReplaySubject } from 'rxjs';

import { LocationService } from 'app/shared/location.service';
import { ApiSection, ApiService } from './api.service';

import { Option } from 'app/shared/select/select.component';
import { map } from 'rxjs/operators';

class SearchCriteria {
  query? = '';
  status? = 'all';
  type? = 'all';
  includeDeprecated? = true;
}

@Component({
  selector: 'aio-api-list',
  template: `<div class="l-flex-wrap api-filter">
      <aio-select (change)="setType($event.option)" [options]="types" [selected]="type" [showSymbol]="true" label="Type:"> </aio-select>

      <div class="form-search">
        <input #filter placeholder="Filter" aria-label="Filter" (input)="setQuery(filter.value)" />
        <i class="material-icons">search</i>
      </div>

      <label class="form-select-button show-deprecated">
        Show deprecated:
        <input type="checkbox" aria-label="Show Deprecated" [(ngModel)]="includeDeprecated" (change)="onIncludeDeprecatedChange()" />
      </label>
    </div>

    <article class="api-list-container l-content-small docs-content">
      <div *ngFor="let section of filteredSections | async">
        <h2 [id]="section.title" *ngIf="section.items">{{ section.title }}</h2>
        <ul class="api-list" *ngIf="section.items?.length">
          <ng-container *ngFor="let item of section.items">
            <li class="api-item">
              <a [href]="item.path">
                <span class="symbol {{ item.docType }}"></span>
                <span class="stability {{ item.stability }}"
                  >{{ item.title }} {{ !item.stability || item.stability === 'stable' ? '' : '(' + item.stability + ')' }}</span
                >
              </a>
            </li>
          </ng-container>
        </ul>
      </div>
    </article> `,
})
export class ApiListComponent implements OnInit {
  filteredSections: Observable<ApiSection[]>;

  showStatusMenu = false;
  showTypeMenu = false;

  private criteriaSubject = new ReplaySubject<SearchCriteria>(1);
  private searchCriteria = new SearchCriteria();

  status: Option;
  type: Option;
  includeDeprecated: boolean;

  // API types
  types: Option[] = [
    { value: 'all', title: 'All' },
    { value: 'class', title: 'Class' },
    { value: 'const', title: 'Const' },
    { value: 'enum', title: 'Enum' },
    { value: 'function', title: 'Function' },
    { value: 'interface', title: 'Interface' },
    { value: 'type-alias', title: 'Type alias' },
  ];

  statuses: Option[] = [
    { value: 'all', title: 'All' },
    { value: 'deprecated', title: 'Deprecated' },
    { value: 'security-risk', title: 'Security Risk' },
  ];

  @ViewChild('filter', { static: true }) queryEl: ElementRef;

  constructor(private apiService: ApiService, private locationService: LocationService) {}

  ngOnInit() {
    this.filteredSections = combineLatest(this.apiService.sections, this.criteriaSubject).pipe(
      map((results) => ({ sections: results[0], criteria: results[1] })),
      map((results) => results.sections.map((section) => ({ ...section, items: this.filterSection(section, results.criteria) })))
    );

    this.initializeSearchCriteria();
  }

  // TODO: may need to debounce as the original did
  // although there shouldn't be any perf consequences if we don't
  setQuery(query: string) {
    this.setSearchCriteria({ query: (query || '').toLowerCase().trim() });
  }

  // NOTE includeDeprecated is model bound - the following method is used for testing
  setIncludeDeprecated(includeDeprecated: boolean) {
    this.includeDeprecated = includeDeprecated;
    this.onIncludeDeprecatedChange();
  }

  onIncludeDeprecatedChange() {
    this.setSearchCriteria({ includeDeprecated: this.includeDeprecated });
  }

  setStatus(status: Option) {
    this.toggleStatusMenu();
    this.status = status;
    this.setSearchCriteria({ status: status.value });
  }

  setType(type: Option) {
    this.toggleTypeMenu();
    this.type = type;
    this.setSearchCriteria({ type: type.value });
  }

  toggleStatusMenu() {
    this.showStatusMenu = !this.showStatusMenu;
  }

  toggleTypeMenu() {
    this.showTypeMenu = !this.showTypeMenu;
  }

  //////// Private //////////

  private filterSection(section: ApiSection, { query, status, type, includeDeprecated }: SearchCriteria) {
    const items = section.items!.filter((item) => {
      return matchesType() && matchesStatus() && matchesQuery() && matchesStability();

      function matchesQuery() {
        return !query || section.name.indexOf(query) !== -1 || item.name.indexOf(query) !== -1;
      }

      function matchesStatus() {
        return status === 'all' || status === item.stability || (status === 'security-risk' && item.securityRisk);
      }

      function matchesType() {
        return type === 'all' || type === item.docType;
      }

      function matchesStability() {
        return includeDeprecated || item.stability !== 'deprecated';
      }
    });

    // If there are no items we still return an empty array if the section name matches and the type is 'package'
    return items.length ? items : type === 'package' && (!query || section.name.indexOf(query) !== -1) ? [] : null;
  }

  // Get initial search criteria from URL search params
  private initializeSearchCriteria() {
    const { query, status, type, includeDeprecated } = this.locationService.search();

    const q = (query || '').toLowerCase();
    // Hack: can't bind to query because input cursor always forced to end-of-line.
    this.queryEl.nativeElement.value = q;

    this.status = this.statuses.find((x) => x.value === status) || this.statuses[0];
    this.type = this.types.find((x) => x.value === type) || this.types[0];
    this.includeDeprecated = includeDeprecated === 'false' ? false : true;

    this.searchCriteria = {
      query: q,
      status: this.status.value,
      type: this.type.value,
      includeDeprecated: this.includeDeprecated,
    };

    this.criteriaSubject.next(this.searchCriteria);
  }

  private setLocationSearch() {
    const { query, status, type, includeDeprecated } = this.searchCriteria;
    const params = {
      query: query ? query : undefined,
      status: status !== 'all' ? status : undefined,
      type: type !== 'all' ? type : undefined,
      includeDeprecated: includeDeprecated ? undefined : 'false',
    };

    this.locationService.setSearch('API Search', params);
  }

  private setSearchCriteria(criteria: SearchCriteria) {
    this.criteriaSubject.next(Object.assign(this.searchCriteria, criteria));
    this.setLocationSearch();
  }
}
