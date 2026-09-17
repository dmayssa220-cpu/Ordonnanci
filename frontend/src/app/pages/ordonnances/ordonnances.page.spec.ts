import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdonnancesPage } from './ordonnances.page';

describe('OrdonnancesPage', () => {
  let component: OrdonnancesPage;
  let fixture: ComponentFixture<OrdonnancesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdonnancesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
