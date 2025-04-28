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
            console.log('Low Stock Response:', response.low_stock);
            if (this.lowStockList.length > 0) {
              this.showLowStockAlert();  
            }
          
            // ✅ For Top Sold
  this.topSoldSeries = [{
  name: 'Top Sold',
  data: response.top_sold.map((p: any) => p.sold_quantity)
}];
this.topSoldChartOptions = {
  chart: { 
    type: 'bar', 
    height: 350,
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: { enabled: true, delay: 150 },
      dynamicAnimation: { enabled: true, speed: 350 }
    }
  },
  colors: ['#FFB6C1'],
  xaxis: {
    categories: response.top_sold.map((p: any) => p.name),
    labels: { rotate: -60, style: { fontSize: '12px' } }
  },
  dataLabels: { enabled: true }
};

this.leastSoldSeries = [{
  name: 'Least Sold',
  data: response.least_sold.map((p: any) => p.sold_quantity)
}];
// ✅ For Least Sold
this.leastSoldChartOptions = {
  chart: {
    type: 'bar',
    height: 350,
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: { enabled: true, delay: 150 },
      dynamicAnimation: { enabled: true, speed: 350 }
    }
  },
  colors: ['#DDA0DD'],
  xaxis: {
    categories: response.least_sold.map((p: any) => p.name),
    labels: { rotate: -60, style: { fontSize: '12px' } }
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
                  type: 'line',
                  height: 300,
                  animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 900,
                    animateGradually: { enabled: true, delay: 100 },
                    dynamicAnimation: { enabled: true, speed: 350 }
                  },
                  toolbar: { show: true }
                },
                stroke: { curve: 'smooth' },
                colors: ['#2196F3'],
                xaxis: { 
                  type: 'category',
                  title: { text: 'Products' }
                },
                yaxis: { title: { text: 'Predicted Sales' } },
                dataLabels: { enabled: true },
                markers: { size: 6, hover: { size: 8 } },
                title: {
                  text: 'Predicted Sales (Linear Regression Model)',
                  align: 'center',
                  style: { fontSize: '18px', fontWeight: 'bold' }
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
    
          // 🔥 Fix: Change predictions → predicted_sales
          if (response.success && response.predicted_sales?.length) {
            this.futureSalesByProductSeries = [{
              name: productName,
              data: response.predicted_sales.map((p: any) => p.quantity) // quantity only
            }];
    
            this.futureSalesByProductChartOptions = {
              chart: { 
                type: 'line', 
                height: 300,
                toolbar: {
                  show: true,
                  offsetY: 10,
                  tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                  },
                  autoSelected: 'zoom'
                }
              },
              xaxis: {
                categories: response.predicted_sales.map((p: any) => `Day ${p.day}`),
                title: { text: 'Day' },
                labels: {
                  rotate: -45,
                  style: { fontSize: '10px' }
                }
              },
              yaxis: {
                title: { text: 'Predicted Quantity' }
              },
              colors: ['#FF9800'],
              dataLabels: { enabled: true },
              stroke: { curve: 'smooth' },
              responsive: [
                {
                  breakpoint: 768,
                  options: {
                    chart: { height: 400 },
                    xaxis: {
                      labels: { rotate: -60, style: { fontSize: '9px' } }
                    }
                  }
                }
              ],
              title: {
                text: `Future Sales for ${productName} (30 Days)`,
                align: 'center',
                style: { fontSize: '18px', fontWeight: 'bold' }
              }
            };
            
            
          } else {
            console.warn("⚠️ No predicted sales found for", productName);
            this.futureSalesByProductSeries = [];
          }
        },
        error: (err) => {
          console.error("❌ API call failed:", err);
        }
      });
    }
    
    lowStockAlertVisible: boolean = false;  // controls alert display

showLowStockAlert(): void {
  if (!this.lowStockList.length) {
    this.lowStockAlertMessage = "✅ All products are sufficiently stocked!";
  } else {
    this.lowStockAlertMessage = this.lowStockList.map(item => 
      `• ${item.name}: ${item.remaining} left`).join('<br>');
  }

  this.lowStockAlertVisible = true;

  // Auto-hide alert after 6 seconds (optional)
  setTimeout(() => this.lowStockAlertVisible = false, 9000);
}

lowStockAlertMessage: string = "";


  }
     

