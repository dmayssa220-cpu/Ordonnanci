import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RendezVousPage } from './rendez-vous.page';

describe('RendezVousPage', () => {
  let component: RendezVousPage;
  let fixture: ComponentFixture<RendezVousPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RendezVousPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
