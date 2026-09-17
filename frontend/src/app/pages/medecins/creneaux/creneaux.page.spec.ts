import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreneauxPage } from './creneaux.page';

describe('CreneauxPage', () => {
  let component: CreneauxPage;
  let fixture: ComponentFixture<CreneauxPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreneauxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
