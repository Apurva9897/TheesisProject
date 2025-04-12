import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // ✅ Important
import { NgApexchartsModule } from 'ng-apexcharts'; // ✅ Important
import { Router } from '@angular/router';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  tabs = ['Dashboard', 'Inventory', 'Orders', 'Customers', 'Reports', 'Help', 'Warehouse Zones'];
  activeTab: string = 'Dashboard';

  totalInventory: number = 0;
  pendingOrders: number = 0;
  lowStockList: any[] = [];

  topSoldSeries: any = [];
  leastSoldSeries: any = [];
  profitTrendSeries: any[] = [];

  topSoldChartOptions: any = {};
  leastSoldChartOptions: any = {};
  profitTrendChartOptions: any = {};

  constructor(private http: HttpClient, private router: Router) {}

  setActiveTab(tab: string) {
    if (tab === 'Warehouse Zones') {
      this.router.navigate(['/admin-warehouse-zones']);
    } else {
      this.activeTab = tab;
    }
  }
  
  ngOnInit(): void {
    this.fetchDashboardData();
  }


  fetchDashboardData() {
    this.http.get<any>('http://127.0.0.1:5000/admin/overview')
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.totalInventory = response.total_inventory;
            this.pendingOrders = response.pending_orders;
            this.lowStockList = response.low_stock || [];

            // Set Top Sold Chart
            this.topSoldSeries = [{ name: 'Top Sold', data: response.top_sold.map((p: any) => p.sold_quantity) }];
            this.topSoldChartOptions = {
              chart: { type: 'bar', height: 300 },
              colors: ['#FFB6C1', '#FF69B4', '#C71585'], // ✅ Magenta shades (light to dark)
              xaxis: { categories: response.top_sold.map((p: any) => p.name) },
              dataLabels: { enabled: true }
            };

            // Set Least Sold Chart
            this.leastSoldSeries = [{ name: 'Least Sold', data: response.least_sold.map((p: any) => p.sold_quantity) }];
            this.leastSoldChartOptions = {
              chart: { type: 'bar', height: 300 },
              colors: ['#E1BEE7', '#BA68C8', '#8E24AA'], // ✅ Purple shades (light to dark)
              xaxis: { categories: response.least_sold.map((p: any) => p.name) },
              dataLabels: { enabled: true }
            };
            // Profit Trend Chart (Line Chart for last 10 days) ✅
            this.profitTrendSeries = [{ name: 'Profit', data: response.profit_trend.map((p: any) => p.profit) }];
            this.profitTrendChartOptions = {
              chart: { type: 'line', height: 300 },  // This makes it a Line Chart
              xaxis: { categories: response.profit_trend.map((p: any) => p.date) },
              colors: ['#4CAF50'],  // Green line for profit
              dataLabels: { enabled: false }
            };
          }
        },
        error: (error) => {
          console.error('Failed to fetch admin overview:', error);
        }
      });

  }
}
