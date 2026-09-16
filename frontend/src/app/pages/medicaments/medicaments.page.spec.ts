import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicamentsPage } from './medicaments.page';

describe('MedicamentsPage', () => {
  let component: MedicamentsPage;
  let fixture: ComponentFixture<MedicamentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicamentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
