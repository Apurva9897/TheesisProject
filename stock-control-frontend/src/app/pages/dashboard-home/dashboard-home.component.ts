import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts'; // ✅ For Charts

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent implements OnInit {

  totalInventory: number = 0;
  pendingOrders: number = 0;
  lowStockList: any[] = [];

  topSoldSeries: any[] = [];
  leastSoldSeries: any[] = [];
  profitTrendSeries: any[] = [];

  topSoldChartOptions: any = {};
  leastSoldChartOptions: any = {};
  profitTrendChartOptions: any = {};

  constructor(private http: HttpClient) {}

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

            this.topSoldSeries = [{ name: 'Top Sold', data: response.top_sold.map((p: any) => p.sold_quantity) }];
            this.topSoldChartOptions = {
              chart: { type: 'bar', height: 300 },
              colors: ['#FFB6C1', '#FF69B4', '#C71585'],
              xaxis: { categories: response.top_sold.map((p: any) => p.name) },
              dataLabels: { enabled: true }
            };

            this.leastSoldSeries = [{ name: 'Least Sold', data: response.least_sold.map((p: any) => p.sold_quantity) }];
            this.leastSoldChartOptions = {
              chart: { type: 'bar', height: 300 },
              colors: ['#E1BEE7', '#BA68C8', '#8E24AA'],
              xaxis: { categories: response.least_sold.map((p: any) => p.name) },
              dataLabels: { enabled: true }
            };

            this.profitTrendSeries = [{ name: 'Profit', data: response.profit_trend.map((p: any) => p.profit) }];
            this.profitTrendChartOptions = {
              chart: { type: 'line', height: 300 },
              colors: ['#4CAF50'],
              xaxis: { categories: response.profit_trend.map((p: any) => p.date) },
              dataLabels: { enabled: false }
            };
          }
        },
        error: (error) => {
          console.error('Failed to fetch dashboard overview:', error);
        }
      });
  }
}
