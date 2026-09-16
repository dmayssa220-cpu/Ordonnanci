import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RappelsPage } from './rappels.page';

describe('RappelsPage', () => {
  let component: RappelsPage;
  let fixture: ComponentFixture<RappelsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RappelsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
