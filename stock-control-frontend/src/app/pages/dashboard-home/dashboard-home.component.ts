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

  futurePredictionSeries: any = [];
  futurePredictionChartOptions: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDashboardData();
    this.fetchFuturePredictions();
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
              xaxis: {
                categories: response.least_sold.map((p: any) => p.name),
                labels: {
                  rotate: -45,                
                  hideOverlappingLabels: false, 
                  showDuplicates: true,          
                  style: {
                    fontSize: '12px'
                  }
                }
              }
              ,
              dataLabels: { enabled: true }
            };

            this.leastSoldSeries = [{ name: 'Least Sold', data: response.least_sold.map((p: any) => p.sold_quantity) }];
            this.leastSoldChartOptions = {
              chart: {
                type: 'bar',
                height: 350
              },
              xaxis: {
                categories: response.least_sold.map((p: any) => p.name),
                labels: {
                  rotate: -45,                
                  hideOverlappingLabels: false,  
                  showDuplicates: true,          
                  style: {
                    fontSize: '12px'
                  }
                }
              },              
              dataLabels: {
                enabled: true
              },
              colors: ['#D8B4FE'], // Light purple
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
    fetchFuturePredictions() {
      this.http.get<any>('http://127.0.0.1:5000/admin/future_sales_prediction')
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.futurePredictionSeries = [{
                name: 'Predicted Sales',
                data: response.future_predictions.map((p: any) => p.predicted_sales)
              }];
  
              this.futurePredictionChartOptions = {
                chart: { 
                  type: 'line', 
                  height: 300,
                  toolbar: { show: false }
                },
                colors: ['#2196F3'],  // 🔵 Nice blue line for trend
                xaxis: { 
                  categories: response.future_predictions.map((p: any) => p.name),
                  title: { text: 'Products' }
                },
                yaxis: {
                  title: { text: 'Predicted Sales' }
                },
                dataLabels: { enabled: true }, // Show values on points
                stroke: {
                  curve: 'smooth'  // ✅ Smooth line instead of sharp edges
                }
              };
              
            }
          },
          error: (error) => {
            console.error('Failed to fetch future predictions:', error);
          }
        });
      }
    }
     

