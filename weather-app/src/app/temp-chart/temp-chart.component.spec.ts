import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TempChartComponent } from './temp-chart.component';

describe('TempChartComponent', () => {
  let component: TempChartComponent;
  let fixture: ComponentFixture<TempChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TempChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TempChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
