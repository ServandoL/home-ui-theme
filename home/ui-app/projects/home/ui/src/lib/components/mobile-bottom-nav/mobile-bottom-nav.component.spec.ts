import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileBottomNavComponent } from './mobile-bottom-nav.component';

describe('MobileBottomNavComponent', () => {
  let component: MobileBottomNavComponent;
  let fixture: ComponentFixture<MobileBottomNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileBottomNavComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileBottomNavComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
