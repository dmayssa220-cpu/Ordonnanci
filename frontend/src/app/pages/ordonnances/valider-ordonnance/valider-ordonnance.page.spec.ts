import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValiderOrdonnancePage } from './valider-ordonnance.page';

describe('ValiderOrdonnancePage', () => {
  let component: ValiderOrdonnancePage;
  let fixture: ComponentFixture<ValiderOrdonnancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ValiderOrdonnancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
