import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InscriptionPage } from './inscription.page';

describe('InscriptionPage', () => {
  let component: InscriptionPage;
  let fixture: ComponentFixture<InscriptionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InscriptionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
