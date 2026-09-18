import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardMedecinPage } from './dashboard-medecin.page';

describe('DashboardMedecinPage', () => {
  let component: DashboardMedecinPage;
  let fixture: ComponentFixture<DashboardMedecinPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardMedecinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
