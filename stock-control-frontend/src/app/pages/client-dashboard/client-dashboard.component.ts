import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // ✅ Import CommonModule
import { FormsModule } from '@angular/forms'; // ✅ Import FormsModule
@Component({
  selector: 'app-client-dashboard',
  standalone: true, // ✅ Ensure it supports standalone components
  imports: [CommonModule, FormsModule], // ✅ Add CommonModule & FormsModule here
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {
  activeTab = 'dashboard';  // Default active tab
  customerName = 'ABC Company';  // Placeholder name
  products: any[] = [];
  orders: any[] = [];
  orderQuantities: { [key: number]: number } = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getProducts();
    this.getOrders();
  }

  // Set Active Tab
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // Fetch Available Products
  getProducts() {
    this.http.get<any[]>('http://127.0.0.1:5000/customer_dashboard/products').subscribe({
      next: (response) => {
        this.products = response;
        this.orderQuantities = {};  // Reset selections
      },
      error: (error) => {
        console.error('Error fetching products', error);
      }
    });
  }

  // Fetch Orders
  getOrders() {
    this.http.get<any[]>('http://127.0.0.1:5000/customer_dashboard/orders').subscribe({
      next: (response) => {
        this.orders = response.map((order: any) => {
          const orderDate = new Date(order.date);
          const daysElapsed = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 3600 * 24));
          let status = 'Processing';
          if (daysElapsed >= 4) status = 'Delivered';
          else if (daysElapsed >= 2) status = 'Shipped';
          return { ...order, status };
        });
      },
      error: (error) => {
        console.error('Error fetching orders', error);
      }
    });
  }

  customerSummary: any = {};

getCustomerSummary() {
  this.http.get<any>('http://127.0.0.1:5000/customer_dashboard/summary')
    .subscribe({
      next: (response) => {
        this.customerSummary = response;
      },
      error: (error) => {
        console.error('Failed to fetch summary:', error);
      }
    });
}

  // Place Order
  placeOrder() {
    const selectedItems = this.products
      .filter(product => this.orderQuantities[product.id] > 0)
      .map(product => ({
        product_id: product.id,
        quantity: this.orderQuantities[product.id]
      }));

    if (selectedItems.length === 0) {
      alert('Please select at least one product.');
      return;
    }

    const payload = {
      items: selectedItems
    };

    this.http.post('http://127.0.0.1:5000/customer_dashboard/place_order', payload).subscribe({
      next: (response: any) => {
        alert('Order placed successfully!');
        this.getOrders();  // Refresh dashboard
        this.orderQuantities = {};
      },
      error: (error) => {
        alert('Error placing order: ' + error.error.message);
      }
    });
  }

  // Track Order
  trackOrder(orderId: number) {
    alert(`Tracking order ID: ${orderId}`);
  }

  // Get status color class
  getStatusClass(status: string): string {
    switch (status) {
      case 'Delivered': return 'status-delivered';
      case 'Shipped': return 'status-shipped';
      case 'Processing': return 'status-processing';
      default: return '';
    }
  }
}
