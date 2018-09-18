import { Component, Input } from '@angular/core';

import { Contributor } from './contributors.model';
import { CONTENT_URL_PREFIX } from 'app/documents/document.service';

@Component({
  selector: 'aio-contributor',
  template: `
    <div [ngClass]="{ 'flipped': person.isFlipped }" class="contributor-card">

        <div class="card-front">
            <h3>{{person.name}}</h3>

            <div class="contributor-image" [style.background-image]="'url('+(person.picture || noPicture)+')'">
                <div class="contributor-info">
                    <a *ngIf="person.bio" mat-button>
                        View Bio
                    </a>
                    <a *ngIf="person.twitter" mat-button class="icon"
                        href="{{person.twitter}}" target="_blank" (click)="$event.stopPropagation()">
                        <span class="fa fa-twitter fa-2x" aria-hidden="true"></span>
                        <span class="sr-only">Twitter {{person.name}}</span>
                    </a>
                    <a *ngIf="person.github" mat-button class="icon"
                        href="{{person.github}}" target="_blank" (click)="$event.stopPropagation()">
                        <span class="fa fa-github fa-2x" aria-hidden="true"></span>
                        <span class="sr-only">Github {{person.name}}</span>
                    </a>
                    <a *ngIf="person.website" mat-button class="icon"
                        href="{{person.website}}" target="_blank" (click)="$event.stopPropagation()">
                        <span class="fa fa-link fa-2x" aria-hidden="true"></span>
                        <span class="sr-only">Personal website {{person.name}}</span>
                    </a>
                </div>
            </div>
        </div>

        <div class="card-back" *ngIf="person.isFlipped" (click)="flipCard(person)">
            <h3>{{person.name}}</h3>
            <p class="contributor-bio">{{person.bio}}</p>
        </div>
    </div>
  `,
})
export class ContributorComponent {
  @Input() person: Contributor;
  noPicture = '_no-one.png';
  pictureBase = CONTENT_URL_PREFIX + 'images/bios/';

  flipCard(person: Contributor) {
    person.isFlipped = !person.isFlipped;
  }
}
