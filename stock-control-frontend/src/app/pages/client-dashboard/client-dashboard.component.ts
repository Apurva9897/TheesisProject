import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {
  selectedItems: any[] = [];
  total: number = 0;
  activeTab = 'dashboard';
  customerName = 'Universal Computer Warehouse';
  
  products: Product[] = [];
  orderQuantities: { [key: number]: number } = {};
  orderErrors: { [key: number]: string } = {};

  constructor(private http: HttpClient, private router: Router) {
    const navState = this.router.getCurrentNavigation()?.extras?.state;
    this.selectedItems = navState?.['items'] || [];
    this.total = this.selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  navigateToConfirmOrder(): void {
    const selectedItems = this.products
    .filter(p => this.orderQuantities[p.id] > 0)
    .map(p => ({
      id: p.id,
      name: p.name,
      quantity: this.orderQuantities[p.id],
      price: p.price,
      image: `assets/${p.name.split(' ').join('')}.png`
    }));

  this.router.navigate(['/confirm-order'], { state: { items: selectedItems } });
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.http.get<any>('http://127.0.0.1:5000/customer_dashboard/products').subscribe({
      next: (response) => {
        if (response.success && response.products) {
          this.products = response.products;
  
          // ✅ Corrected: Initialize order quantities to 0
          this.products.forEach(product => {
            this.orderQuantities[product.id] = 0;
            this.orderErrors[product.id] = '';
          });
        }
      },
      error: (err) => {
        console.error('Failed to fetch products:', err);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getStockLabel(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return `Low Stock: ${stock} left`;
    return `In Stock: ${stock} available`;
  }

  validateQuantity(productId: number, stock: number): void {
    const quantity = this.orderQuantities[productId];
    this.orderErrors[productId] = '';

    if (isNaN(quantity) || quantity <= 0) {
      this.orderErrors[productId] = 'Please enter a valid quantity';
      this.orderQuantities[productId] = 1;
      return;
    }

    if (quantity > stock) {
      this.orderErrors[productId] = `Only ${stock} items available`;
      this.orderQuantities[productId] = stock;
      return;
    }

    this.orderQuantities[productId] = Math.floor(quantity);
  }

  incrementQuantity(productId: number, stock: number): void {
    if (this.orderQuantities[productId] < stock) {
      this.orderQuantities[productId]++;
      this.validateQuantity(productId, stock);
    }
  }

  decrementQuantity(productId: number): void {
    if (this.orderQuantities[productId] > 1) {
      this.orderQuantities[productId]--;
      this.orderErrors[productId] = '';
    }
  }

  addToCart(productId: number): void {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
  
    const stock = product.stock;
    const quantity = this.orderQuantities[productId];
  
    if (quantity > stock) {
      this.orderErrors[productId] = `Only ${stock} items available`;
      return;
    }
  
    if (stock === 0) {
      this.orderErrors[productId] = 'This item is out of stock';
      return;
    }
  
    alert(`Added ${quantity} ${product.name}(s) to your cart.`);
  
    // ✅ Increment cart item count
    this.total += quantity;
    
  }
  
}
