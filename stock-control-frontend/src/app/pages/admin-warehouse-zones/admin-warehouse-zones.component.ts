import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ApexChart, ApexXAxis, ApexDataLabels, ApexTitleSubtitle, ApexYAxis } from 'ng-apexcharts';

export type ChartOptions = {
  series: { name: string; data: number[] }[];
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
  styleUrl: './admin-warehouse-zones.component.css',
  imports: [CommonModule, NgApexchartsModule, RouterModule]
})
export class AdminWarehouseZonesComponent implements OnInit {
  selectedZone: string = '';
  items: any[] = [];
  shelves: any[] = [];
  loadingItems: boolean = false;
  activeTab: string = 'items';
  shelfChartOptions: ChartOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 320,
      stacked: true
    },
    xaxis: {
      categories: []
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

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {}

  fetchItemsByZone(zoneName: string) {
    this.selectedZone = zoneName;
    this.items = [];
    this.shelves = [];
    this.activeTab = 'items';
    this.loadingItems = true;

    // ✅ Only set items from here — DO NOT update shelves
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

    // ✅ Only set shelves from here — this is the correct data
    this.http.get<any>(`http://127.0.0.1:5000/admin/get_shelves_by_zone/${zoneName}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.shelves = response.shelves;
            this.prepareShelfChartData(); // Prepare chart from correct shelf data
          }
        },
        error: (error) => {
          console.error('Error fetching shelves', error);
        }
      });
  }

  prepareShelfChartData() {
    const categories = this.shelves.map(s => s.product || 'Empty');
    const occupied = this.shelves.map(s => s.occupied);
    const available = this.shelves.map(s => s.available);

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
      dataLabels: { enabled: false },
      colors: ['#F44336', '#4CAF50'],
      title: { text: 'Product Capacity Overview', align: 'left' }
    };
  }

  getStatusColor(percent: string): string {
    const val = Number(percent.replace('%', ''));
    if (val < 50) return 'text-success';
    else if (val < 80) return 'text-warning';
    return 'text-danger';
  }
}
