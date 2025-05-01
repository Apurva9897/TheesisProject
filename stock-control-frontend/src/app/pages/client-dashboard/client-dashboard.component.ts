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
  sold_quantity: number;

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
  selectedBestSeller: string = '';
  selectedStock: string = '';
  selectedPrice: string = '';
  dropdownOpen = false;
  toastMessage: string = '';
  showToast: boolean = false;
  

  customerName = 'Universal Computer Warehouse';
  
  products: Product[] = [];
  filteredProducts: Product[] = [];
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
        image: `${p.name.split(' ').join('')}.png`
      }));
  
    const customerEmail = sessionStorage.getItem('user_email');  // ✅ get saved email
  
    // 🛑 Add a check
    if (!customerEmail) {
      alert('No email found. Please login again.');
      return;
    }
  
    // ✅ Pass email + items
    this.router.navigate(['/confirm-order'], {
      state: { 
        items: selectedItems,
        email: customerEmail
      }
    });
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
          this.filteredProducts = [...this.products];
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
  
    this.toastMessage = `Added ${quantity} ${product.name}(s) to your cart.`;
this.showToast = true;

setTimeout(() => {
  this.showToast = false;
}, 3000);
  
    // ✅ Increment cart item count
    this.total += quantity;
    
  }

  applyFilters(): void {
    let filtered: Product[] = [...this.products];  // Start fresh
  
    // 1. Stock Availability filter
    if (this.selectedStock === 'in') {
      filtered = filtered.filter((product) => product.stock > 0);
    } else if (this.selectedStock === 'low') {
      filtered = filtered.filter((product) => product.stock > 0 && product.stock <= 10);
    } else if (this.selectedStock === 'out') {
      filtered = filtered.filter((product) => product.stock === 0);
    }
  
    // 2. Price sort
    if (this.selectedPrice === 'lowtohigh') {
      filtered = filtered.sort((a: Product, b: Product) => a.price - b.price);
    } else if (this.selectedPrice === 'hightolow') {
      filtered = filtered.sort((a: Product, b: Product) => b.price - a.price);
    }
  
    // 3. Best Seller filter (apply after stock + price)
    if (this.selectedBestSeller === 'top') {
      filtered = filtered.sort((a: Product, b: Product) => (b.sold_quantity || 0) - (a.sold_quantity || 0)).slice(0, 5);
    } else if (this.selectedBestSeller === 'low') {
      filtered = filtered.sort((a: Product, b: Product) => (a.sold_quantity || 0) - (b.sold_quantity || 0)).slice(0, 5);
    }
  
    // ✅ Update the filteredProducts finally
    this.filteredProducts = filtered;
  }

  resetFilters(): void {
    this.selectedBestSeller = '';
    this.selectedStock = '';
    this.selectedPrice = '';
    this.filteredProducts = [...this.products]; // Show all products again
  }
  


toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}

goToUpdateProfile() {
  this.dropdownOpen = false;
  this.router.navigate(['/update-profile']);  // we will create this page next
}

signOut() {
  this.dropdownOpen = false;
  localStorage.clear();  // clear login info
  this.router.navigate(['/login']);  // go to login page
}

goToTrackOrders() {
  this.router.navigate(['/track-orders']);
}

viewBasket(): void {
  const itemsInBasket = this.products
    .filter(p => this.orderQuantities[p.id] > 0)
    .map(p => `${p.name} - Quantity: ${this.orderQuantities[p.id]}`)
    .join('<br>');

  const toastContainer = document.getElementById('toastContainer');
  if (toastContainer) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `<div class="toast-body"><strong>Your Basket:</strong><br>${itemsInBasket || 'No items in basket.'}</div>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}


  
}
