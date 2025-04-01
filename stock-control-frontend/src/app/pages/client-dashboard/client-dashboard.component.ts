import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {
  activeTab = 'dashboard';
  customerName = 'ABC Company';
  orderQuantities: { [key: number]: number } = {};
  orderErrors: { [key: number]: string } = {};

  // Explicit product information
  productPrices: { [key: number]: number } = {
    1: 129.99,  // iPhone15
    2: 199.99,  // Samsung Galaxy S23
    3: 89.99,   // Sony WH-1000XM5
    4: 149.99,  // Dell XPS 15
    5: 79.99,   // Logitech MX Master3
    6: 499.99   // Amazon Echo Dot
  };
  
  productStock: { [key: number]: number } = {
    1: 20,  // iPhone15
    2: 15,  // Samsung Galaxy S23
    3: 30,  // Sony WH-1000XM5
    4: 8,   // Dell XPS 15 (low stock)
    5: 0,   // Logitech MX Master3 (out of stock)
    6: 12   // Amazon Echo Dot
  };
  
  productNames: { [key: number]: string } = {
    1: 'iPhone15',
    2: 'Samsung Galaxy S23',
    3: 'Sony WH-1000XM5',
    4: 'Dell XPS 15',
    5: 'Logitech MX Master3',
    6: 'Amazon Echo Dot'
  };
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initializeOrderQuantities();
    
    // Optionally try to fetch data from API
    this.tryFetchProductData();
  }
  
  tryFetchProductData() {
    // Only use this if you want to try to fetch real data from your API
    this.http.get<any[]>('http://127.0.0.1:5000/customer_dashboard/products').subscribe({
      next: (response) => {
        // Update stocks from API response if available
        response.forEach(item => {
          if (item.id in this.productStock) {
            this.productStock[item.id] = item.stock || 0;
          }
        });
        this.initializeOrderQuantities();
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        // Already using hardcoded data, so no further action needed
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  initializeOrderQuantities() {
    // Set default quantity to 1 for each product or 0 if out of stock
    for (let i = 1; i <= 6; i++) {
      this.orderQuantities[i] = this.productStock[i] > 0 ? 1 : 0;
      this.orderErrors[i] = '';
    }
  }

  // Get stock display label
  getStockLabel(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return `Low Stock: ${stock} left`;
    return `In Stock: ${stock} available`;
  }

  // Validate quantity against stock
  validateQuantity(productId: number, stock: number) {
    const quantity = this.orderQuantities[productId];
    
    // Reset error first
    this.orderErrors[productId] = '';
    
    // Check if quantity is a valid number
    if (isNaN(quantity) || quantity <= 0) {
      this.orderErrors[productId] = 'Please enter a valid quantity';
      this.orderQuantities[productId] = 1;
      return;
    }
    
    // Check if quantity is larger than available stock
    if (quantity > stock) {
      this.orderErrors[productId] = `Only ${stock} items available`;
      this.orderQuantities[productId] = stock;
      return;
    }
    
    // Ensure quantity is an integer
    this.orderQuantities[productId] = Math.floor(quantity);
  }

  // Quantity control methods
  incrementQuantity(productId: number) {
    const stock = this.productStock[productId];
    
    if (this.orderQuantities[productId] < stock) {
      this.orderQuantities[productId]++;
      this.validateQuantity(productId, stock);
    }
  }

  decrementQuantity(productId: number) {
    if (this.orderQuantities[productId] > 1) {
      this.orderQuantities[productId]--;
      this.orderErrors[productId] = '';
    }
  }

  // Add to cart method
  addToCart(productId: number) {
    const stock = this.productStock[productId];
    const quantity = this.orderQuantities[productId];
    const productName = this.productNames[productId];
    
    // Validate one more time to be sure
    if (quantity > stock) {
      this.orderErrors[productId] = `Only ${stock} items available`;
      return;
    }
    
    if (stock === 0) {
      this.orderErrors[productId] = 'This item is out of stock';
      return;
    }
    
    // If all is well, add to cart
    alert(`Added ${quantity} ${productName}(s) to your cart.`);
    
    // Reset quantity to 1
    this.orderQuantities[productId] = 1;
  }
}