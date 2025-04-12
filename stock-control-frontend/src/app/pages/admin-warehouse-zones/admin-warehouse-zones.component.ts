import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-admin-warehouse-zones',
  templateUrl: './admin-warehouse-zones.component.html',
  styleUrls: ['./admin-warehouse-zones.component.css'],
  imports: [CommonModule]
})
export class AdminWarehouseZonesComponent implements OnInit {

  zones: any[] = [];
  selectedZone: string = '';
  items: any[] = [];
  loadingItems: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchZones();
  }

  fetchZones() {
    this.http.get<any>('http://127.0.0.1:5000/admin/zones')
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.zones = response.zones;
          }
        },
        error: (error) => {
          console.error('Error fetching zones', error);
        }
      });
  }

  fetchItemsByZone(zoneName: string) {
    this.selectedZone = zoneName;
    this.items = [];
    this.loadingItems = true;

    this.http.get<any>(`http://127.0.0.1:5000/admin/items_by_zone/${zoneName}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.items = response.items;
          }
          this.loadingItems = false;
        },
        error: (error) => {
          console.error('Error fetching items', error);
          this.loadingItems = false;
        }
      });
  }
}
