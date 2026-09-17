import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedecinsPage } from './medecins.page';

describe('MedecinsPage', () => {
  let component: MedecinsPage;
  let fixture: ComponentFixture<MedecinsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MedecinsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
