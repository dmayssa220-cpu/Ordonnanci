import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPatientPage } from './dashboard-patient.page';

describe('DashboardPatientPage', () => {
  let component: DashboardPatientPage;
  let fixture: ComponentFixture<DashboardPatientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPatientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
