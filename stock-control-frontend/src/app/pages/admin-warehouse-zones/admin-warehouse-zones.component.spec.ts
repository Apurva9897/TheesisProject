import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWarehouseZonesComponent } from './admin-warehouse-zones.component';

describe('AdminWarehouseZonesComponent', () => {
  let component: AdminWarehouseZonesComponent;
  let fixture: ComponentFixture<AdminWarehouseZonesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminWarehouseZonesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminWarehouseZonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
