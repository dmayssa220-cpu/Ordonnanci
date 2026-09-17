import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScannerOrdonnancePage } from './scanner-ordonnance.page';

describe('ScannerOrdonnancePage', () => {
  let component: ScannerOrdonnancePage;
  let fixture: ComponentFixture<ScannerOrdonnancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ScannerOrdonnancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
