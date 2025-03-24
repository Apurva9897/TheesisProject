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
    this.http.get<any[]>('http://127.0.0.1:5000/customer-dashboard/products')
      .subscribe(response => {
        this.products = response;
      });
  }

  // Fetch Orders
  getOrders() {
    this.http.get<any[]>('http://127.0.0.1:5000/customer-dashboard/orders')
      .subscribe(response => {
        this.orders = response;
      });
  }

  // Place Order
  placeOrder() {
    const selectedItems = Object.entries(this.orderQuantities)
      .filter(([id, quantity]) => quantity > 0)
      .map(([id, quantity]) => ({ product_id: id, quantity }));

    if (selectedItems.length === 0) {
      alert("Please select at least one product.");
      return;
    }

    this.http.post('http://127.0.0.1:5000/customer-dashboard/place-order', { items: selectedItems })
      .subscribe(response => {
        alert('Order placed successfully!');
        this.getOrders();  // Refresh orders
      }, error => {
        alert('Error placing order: ' + error.error.message);
      });
  }

  // Track Order
  trackOrder(orderId: number) {
    alert(`Tracking order ID: ${orderId}`);
  }

  // Get status color class
  getStatusClass(status: string) {
    return {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped'
    }[status] || '';
  }
}
