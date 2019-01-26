import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatButtonModule,
  MatCardModule,
  MatRippleModule
} from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollService } from 'app/shared/scroll.service';
import { BehaviorSubject } from 'rxjs';
import { treeNodeStubNoOptions, treeNodeStubWithOptionsA } from './fixtures';
import { OperatorDecisionTreeComponent } from './operator-decision-tree.component';
import { OperatorDecisionTreeService } from './operator-decision-tree.service';

const operatorDecisionTreeServiceStub = {
  currentSentence$: new BehaviorSubject('Conditioner is better'),
  options$: new BehaviorSubject([treeNodeStubWithOptionsA]),
  isBeyondInitialQuestion$: new BehaviorSubject(false),
  hasError$: new BehaviorSubject(false),
  selectOption: jasmine.createSpy(),
  back: jasmine.createSpy(),
  startOver: jasmine.createSpy()
};

describe('OperatorDecisionTreeComponent', () => {
  let component: OperatorDecisionTreeComponent;
  let fixture: ComponentFixture<OperatorDecisionTreeComponent>;
  let operatorDecisionTreeService: OperatorDecisionTreeService;
  let scrollService: ScrollService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatRippleModule,
        NoopAnimationsModule
      ],
      declarations: [OperatorDecisionTreeComponent],
      providers: [
        {
          provide: OperatorDecisionTreeService,
          useValue: operatorDecisionTreeServiceStub
        },
        ScrollService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorDecisionTreeComponent);
    component = fixture.componentInstance;
    operatorDecisionTreeService = TestBed.get(OperatorDecisionTreeService);
    scrollService = TestBed.get(ScrollService);
    fixture.detectChanges();
  });

  afterEach(() => {
    operatorDecisionTreeServiceStub.currentSentence$.next(
      'Conditioner is better'
    );
    operatorDecisionTreeServiceStub.options$.next([treeNodeStubWithOptionsA]);
    operatorDecisionTreeServiceStub.isBeyondInitialQuestion$.next(false);
    operatorDecisionTreeServiceStub.hasError$.next(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('in the template', () => {
    describe('when the OperatorDecisionTreeService.currentSentence$ emits a signal', () => {
      it('should update what is being displayed as the current sentence', () => {
        expect(
          fixture.debugElement.query(By.css('h2')).nativeElement.textContent
        ).toContain('Conditioner is better');

        operatorDecisionTreeServiceStub.currentSentence$.next(
          'Shampoo is better'
        );
        fixture.detectChanges();

        expect(
          fixture.debugElement.query(By.css('h2')).nativeElement.textContent
        ).toContain('Shampoo is better');
      });
    });

    describe('when there are options to choose', () => {
      it('should have option buttons', () => {
        expect(
          fixture.debugElement.queryAll(By.css('button.option')).length
        ).toBeTruthy();
      });
    });

    describe('when there are no more options to choose', () => {
      it('should have no option buttons', () => {
        operatorDecisionTreeServiceStub.options$.next([
          treeNodeStubNoOptions as any
        ]);
        fixture.detectChanges();

        expect(
          fixture.debugElement.queryAll(By.css('button.option')).length
        ).toBeFalsy();
      });

      describe('when there is a method associated with the operator', () => {
        it('should display a method, docType, label, and a link to the operator path', () => {
          const node = {
            ...treeNodeStubNoOptions,
            method: 'someMethod'
          };
          operatorDecisionTreeServiceStub.options$.next([node as any]);
          fixture.detectChanges();

          const sentence: HTMLParagraphElement = fixture.debugElement.query(
            By.css('p')
          ).nativeElement;
          const link: HTMLAnchorElement = fixture.debugElement
            .query(By.css('a'))
            .nativeElement.getAttribute('href');

          expect(sentence.textContent).toContain(
            `You want the ${node.method} of the ${node.docType} ${node.label}.`
          );
          expect(link).toContain(`${node.path}#${node.method}`);
        });
      });

      describe('when there is no method associated with the operator', () => {
        it('should display a docType, label, and a link to the operator path', () => {
          operatorDecisionTreeServiceStub.options$.next([
            treeNodeStubNoOptions as any
          ]);
          fixture.detectChanges();

          const sentence: HTMLParagraphElement = fixture.debugElement.query(
            By.css('p')
          ).nativeElement;
          const link: HTMLAnchorElement = fixture.debugElement
            .query(By.css('a'))
            .nativeElement.getAttribute('href');

          expect(sentence.textContent).toContain(
            `You want the ${treeNodeStubNoOptions.docType} ${
              treeNodeStubNoOptions.label
            }.`
          );
          expect(link).toContain(treeNodeStubNoOptions.path);
        });
      });
    });

    describe('when there are no errors', () => {
      it('should not display the error template', () => {
        expect(fixture.debugElement.query(By.css('div.error'))).toBeNull();
      });
    });

    describe('when there is an error', () => {
      it('should display the error template', () => {
        operatorDecisionTreeServiceStub.hasError$.next(true);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('div.error'))).toBeTruthy();
      });
    });
  });

  describe('selectOption', () => {
    describe('when an option is clicked', () => {
      it('should call the selectOption method', () => {
        spyOn(component, 'selectOption');
        fixture.debugElement
          .query(By.css('button.option'))
          .triggerEventHandler('click', null);
        expect(component.selectOption).toHaveBeenCalled();
      });
    });

    describe('when fired', () => {
      it('should call the selectOption method on the operatorDecisionTreeService', () => {
        component.selectOption(treeNodeStubWithOptionsA.id);
        expect(operatorDecisionTreeService.selectOption).toHaveBeenCalledWith(
          treeNodeStubWithOptionsA.id
        );
      });
      it('should call the scrollToTop method of the scrollService', () => {
        spyOn(scrollService, 'scrollToTop');
        component.selectOption(treeNodeStubWithOptionsA.id);
        expect(scrollService.scrollToTop).toHaveBeenCalled();
      });
    });
  });

  describe('back', () => {
    describe('when the back button is pressed', () => {
      it('should should call the back method', () => {
        spyOn(component, 'back');
        operatorDecisionTreeServiceStub.isBeyondInitialQuestion$.next(true);
        fixture.detectChanges();
        fixture.debugElement
          .query(By.css('button.back'))
          .triggerEventHandler('click', null);
        expect(component.back).toHaveBeenCalled();
      });
    });

    describe('when fired', () => {
      it('should call the back method on the operatorDecisionTreeService', () => {
        component.back();
        expect(operatorDecisionTreeService.back).toHaveBeenCalled();
      });
    });
  });

  describe('startOver', () => {
    describe('when the start-over button is pressed', () => {
      it('should should call the startOver method', () => {
        spyOn(component, 'startOver');
        operatorDecisionTreeServiceStub.isBeyondInitialQuestion$.next(true);
        fixture.detectChanges();
        fixture.debugElement
          .query(By.css('button.start-over'))
          .triggerEventHandler('click', null);
        expect(component.startOver).toHaveBeenCalled();
      });
    });

    describe('when fired', () => {
      it('should call the startOver method on the operatorDecisionTreeService', () => {
        component.startOver();
        expect(operatorDecisionTreeService.startOver).toHaveBeenCalled();
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should call the startOver method', () => {
      spyOn(component, 'startOver');
      component.ngOnDestroy();
      expect(component.startOver).toHaveBeenCalled();
    });
  });
});
