import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

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
  products: Product[] = [];
  featuredProducts: Product[] = [];
  orderQuantities: { [key: number]: number } = {};
  cartItems: CartItem[] = [];
  customerSummary: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getProducts();
    this.getCustomerSummary();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getProducts() {
    this.http.get<Product[]>('http://127.0.0.1:5000/customer_dashboard/products').subscribe({
      next: (response) => {
        this.products = response;
        // Initialize featured products with some from the product list
        // In a real app, this might come from a different endpoint
        this.featuredProducts = this.products.slice(0, 6);
        this.initializeOrderQuantities();
      },
      error: (error) => {
        console.error('Error fetching products', error);
        // Fallback to mock data if API fails
        this.loadMockProducts();
      }
    });
  }

  // Fallback method to load mock products if API fails
  loadMockProducts() {
    this.featuredProducts = [
      {
        id: 1,
        name: 'Wireless Headphones',
        description: 'High-quality sound with noise cancellation and extended battery life.',
        price: 129.99,
        stock: 50,
        image: 'headphones.jpg'
      },
      {
        id: 2,
        name: 'Smart Watch',
        description: 'Fitness tracking, heart rate monitoring, and smart notifications.',
        price: 199.99,
        stock: 30,
        image: 'smartwatch.jpg'
      },
      {
        id: 3,
        name: 'Bluetooth Speaker',
        description: 'Portable speaker with 360° sound and 12-hour battery life.',
        price: 89.99,
        stock: 40,
        image: 'speaker.jpg'
      },
      {
        id: 4,
        name: 'Coffee Maker',
        description: 'Programmable coffee machine with built-in grinder.',
        price: 149.99,
        stock: 25,
        image: 'coffeemaker.jpg'
      },
      {
        id: 5,
        name: 'Fitness Tracker',
        description: 'Water-resistant activity tracker with sleep monitoring.',
        price: 79.99,
        stock: 60,
        image: 'fitnesstracker.jpg'
      },
      {
        id: 6,
        name: 'Digital Camera',
        description: '20MP camera with 4K video recording and stabilization.',
        price: 499.99,
        stock: 15,
        image: 'camera.jpg'
      }
    ];
    this.initializeOrderQuantities();
  }

  initializeOrderQuantities() {
    this.featuredProducts.forEach(product => {
      if (!this.orderQuantities[product.id]) {
        this.orderQuantities[product.id] = 1;
      }
    });
  }

  getCustomerSummary() {
    this.http.get<any>('http://127.0.0.1:5000/customer_dashboard/summary').subscribe({
      next: (response) => {
        this.customerSummary = response;
      },
      error: (error) => {
        console.error('Failed to fetch summary:', error);
        // Fallback to mock data
        this.customerSummary = {
          account_id: 'ACC-12345',
          name: 'ABC Company',
          email: 'contact@abccompany.com',
          phone: '555-123-4567'
        };
      }
    });
  }

  // Product Quantity Controls
  incrementQuantity(product: Product) {
    if (this.orderQuantities[product.id] < product.stock) {
      this.orderQuantities[product.id]++;
    }
  }

  decrementQuantity(product: Product) {
    if (this.orderQuantities[product.id] > 1) {
      this.orderQuantities[product.id]--;
    }
  }

  // Add product to cart
  addToCart(product: Product) {
    const quantity = this.orderQuantities[product.id];
    
    // Check if product is already in cart
    const existingItemIndex = this.cartItems.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already exists in cart
      this.cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      this.cartItems.push({
        product: product,
        quantity: quantity
      });
    }
    
    alert(`Added ${quantity} ${product.name} to your cart!`);
    // Reset quantity to 1
    this.orderQuantities[product.id] = 1;
  }

  // For now, we're just implementing a shell for future functionality
  // Additional methods for the other tabs will be added later
}