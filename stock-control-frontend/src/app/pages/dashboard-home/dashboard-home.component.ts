import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts'; // ✅ For Charts
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, FormsModule],
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
  productNames: string[] = [];
  selectedProductName: string = '';
  futureSalesByProductSeries: any[] = [];
  futureSalesByProductChartOptions: any = {};
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDashboardData();
    this.fetchFuturePredictions();
     // 🆕 Get all product names for dropdown
     this.http.get<any>('http://127.0.0.1:5000/admin/get_all_product_names')
     .subscribe({
       next: (res) => {
         if (res.success) this.productNames = res.names;
       },
       error: (err) => {
         console.error('Failed to fetch product names', err);
       }
     });
 }

  fetchDashboardData() {
    this.http.get<any>('http://127.0.0.1:5000/admin/overview')
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.totalInventory = response.total_inventory;
            this.pendingOrders = response.pending_orders;
            this.lowStockList = response.low_stock || [];


            // ✅ For Top Sold
  this.topSoldSeries = [{
  name: 'Top Sold',
  data: response.top_sold.map((p: any) => p.sold_quantity)
}];
this.topSoldChartOptions = {
  chart: { type: 'bar', height: 350 },
  colors: ['#FFB6C1', '#FF69B4', '#C71585'],
  xaxis: {
    categories: response.top_sold.map((p: any) => p.name),  // ✅ correct names
    labels: {
      rotate: -60,
      trim: true,
      hideOverlappingLabels: false,
      showDuplicates: true,
      style: { fontSize: '12px' }
    }
  },
  dataLabels: { enabled: true }
};

// ✅ For Least Sold
this.leastSoldSeries = [{
  name: 'Least Sold',
  data: response.least_sold.map((p: any) => p.sold_quantity)
}];
this.leastSoldChartOptions = {
  chart: { type: 'bar', height: 350 },
  colors: ['#D8BFD8', '#DDA0DD', '#BA55D3'],
  xaxis: {
    categories: response.least_sold.map((p: any) => p.name),  // ✅ correct names
    labels: {
      rotate: -60,
      trim: true,
      hideOverlappingLabels: false,
      showDuplicates: true,
      style: { fontSize: '12px' }
    }
  },
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
    fetchFuturePredictions() {
      this.http.get<any>('http://127.0.0.1:5000/admin/future_sales_prediction')
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.futurePredictionSeries = [
                {
                  name: 'Predicted Sales',
                  data: response.future_predictions.map((p: any, index: number) => ({
                    x: p.name,
                    y: p.predicted_sales
                  }))
                }
              ];
    
              this.futurePredictionChartOptions = {
                chart: { 
                  type: 'scatter',    // 🔥 Change type to 'scatter'
                  height: 300,
                  toolbar: { show: false },
                  zoom: { enabled: true }
                },
                colors: ['#2196F3'],
                xaxis: { 
                  type: 'category',
                  title: { text: 'Products' }
                },
                yaxis: {
                  title: { text: 'Predicted Sales' }
                },
                dataLabels: { enabled: true },
                stroke: {
                  curve: 'smooth',   // 🔥 Smooth curve between points
                  width: 2
                },
                markers: {
                  size: 6,           // 🔵 Make dots bigger
                  hover: { size: 8 }
                },
                title: {
                  text: 'Predicted Sales (Linear Regression Model for Next 15 Days)', // 🔥 Title added
                  align: 'center',
                  style: {
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }
                }
              };
            }
          },
          error: (error) => {
            console.error('Failed to fetch future predictions:', error);
          }
        });
    } 
    
    fetchPredictionByProduct(productName: string) {
      if (!productName) return;
    
      const url = 'http://127.0.0.1:5000/admin/predict_sales_by_product';
    
      this.http.post<any>(url, { product_name: productName }, { withCredentials: true }).subscribe({
        next: (response) => {
          console.log("✅ Backend Response:", response); // debug output
    
          if (response.success && response.predictions?.length) {
            this.futureSalesByProductSeries = [{
              name: productName,
              data: response.predictions.map((p: any) => p.quantity)  // ✅ fix key from 'sales' to 'quantity'
            }];
    
            this.futureSalesByProductChartOptions = {
              chart: { type: 'line', height: 300 },
              xaxis: {
                categories: response.predictions.map((p: any) => `Day ${p.day}`),  // ✅ fix from 'p.date'
                title: { text: 'Day' }
              },
              yaxis: {
                title: { text: 'Predicted Quantity' }
              },
              colors: ['#FF9800'],
              dataLabels: { enabled: true },
              stroke: { curve: 'smooth' },
              title: {
                text: `Future Sales for ${productName} (90 Days)`,
                align: 'center',
                style: { fontSize: '18px', fontWeight: 'bold' }
              }
            };
          } else {
            console.warn("⚠️ No predictions found for", productName);
            this.futureSalesByProductSeries = [];
          }
        },
        error: (err) => {
          console.error("❌ API call failed:", err);
        }
      });
    }
    
  }
     

