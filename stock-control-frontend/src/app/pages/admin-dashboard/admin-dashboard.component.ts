import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // ✅ Important
import { NgApexchartsModule } from 'ng-apexcharts'; // ✅ Important
import { Router, RouterModule, ActivatedRoute, NavigationEnd   } from '@angular/router';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  tabs = ['Dashboard', 'Suppliers', 'Reports', 'Warehouse Zones'];
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
  dropdownOpen = false; 
  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      if (this.router.url.includes('warehouse-zones')) {
        this.activeTab = 'Warehouse Zones';
      } else {
        // Default back to Dashboard if user is on /admin-dashboard
        this.activeTab = 'Dashboard';
      }
    }
  });
}

  setActiveTab(tab: string) {
    if (tab === 'Warehouse Zones') {
      this.router.navigate(['warehouse-zones'], { relativeTo: this.route });
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

  getRouterLink(tab: string): string | any[] {
    if (tab === 'Warehouse Zones') {
      return ['/admin-dashboard/warehouse-zones']; 
    }
    // Otherwise stay at dashboard page
    return ['/admin-dashboard']; 
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  
  // ✅ Logout method
  logout() {
    localStorage.clear();     // Clear admin login info
    sessionStorage.clear();   // If you are using sessionStorage anywhere
    this.router.navigate(['/login']); // Redirect to admin-login page
  }
  
}
