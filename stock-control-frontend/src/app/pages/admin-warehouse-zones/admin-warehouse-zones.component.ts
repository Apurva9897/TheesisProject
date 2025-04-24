import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexYAxis,
  ApexNonAxisChartSeries,
  ApexAxisChartSeries
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  yaxis?: ApexYAxis;
  colors?: string[];
};

@Component({
  selector: 'app-admin-warehouse-zones',
  standalone: true,
  templateUrl: './admin-warehouse-zones.component.html',
  styleUrls: ['./admin-warehouse-zones.component.css'],
  imports: [CommonModule, NgApexchartsModule]
})
export class AdminWarehouseZonesComponent implements OnInit {
  zones: any[] = [];
  selectedZone: string = '';
  items: any[] = [];
  shelves: any[] = [];
  loadingItems: boolean = false;
  activeTab: string = 'product';
  shelfChartOptions!: ChartOptions;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchZones();
  }

  fetchZones() {
    this.http.get<any>('http://127.0.0.1:5000/admin/zones').subscribe({
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
    this.shelves = [];
    this.activeTab = 'product';
    this.loadingItems = true;

    this.http.get<any>(`http://127.0.0.1:5000/admin/items_by_zone/${zoneName}`).subscribe({
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

    this.http.get<any>(`http://127.0.0.1:5000/admin/get_shelves_by_zone/${zoneName}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.shelves = response.shelves;
          this.prepareShelfChartData(); // 🧠 Chart data now prepared only after shelves are fetched
        }
      },
      error: (error) => {
        console.error('Error fetching shelves', error);
      }
    });
  }

  prepareShelfChartData() {
    if (!this.shelves || this.shelves.length === 0) return;
  
    const categories = this.shelves.map(s => s.product || 'Empty');
    const occupied = this.shelves.map(s => s.occupied ?? 0);
    const available = this.shelves.map(s => (s.capacity ?? 0) - (s.stock ?? 0));
  
    this.shelfChartOptions = {
      series: [
        { name: 'Occupied', data: occupied },
        { name: 'Available', data: available }
      ],
      chart: {
        type: 'bar',
        height: 320,
        stacked: true
      },
      xaxis: {
        categories: categories
      },
      dataLabels: {
        enabled: false
      },
      title: {
        text: 'Product Capacity Overview',
        align: 'left'
      },
      colors: ['#F44336', '#4CAF50']
    };
  }
  

  getZoneCardClass(zone: string): string {
    const map: { [key: string]: string } = {
      'Zone A': 'bg-info',
      'Zone B': 'bg-danger',
      'Zone C': 'bg-warning',
      'Zone D': 'bg-success'
    };
    return map[zone] || 'bg-secondary';
  }

  getStatusColor(percent: string): string {
    const val = Number(percent.replace('%', ''));
    if (val < 50) return 'text-success';
    else if (val < 80) return 'text-warning';
    return 'text-danger';
  }
}
