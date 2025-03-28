import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.css']
})
export class PlaceOrderComponent implements OnInit {
  products: any[] = [];
  selectedProducts: any[] = [];
  subtotal: number = 0;
  totalPrice: number = 0;
  customerEmail: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.getAvailableProducts();
    this.getCustomerEmail(); // Retrieve logged-in user email
  }

  getCustomerEmail() {
    this.customerEmail = sessionStorage.getItem('userEmail') || ''; // Fetch email from session storage
  }

  getAvailableProducts() {
    this.http.get<any>('http://127.0.0.1:5000/customer_dashboard/products').subscribe({
      next: (data) => {
        this.products = data.products;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });
  }

  updateTotal() {
    this.subtotal = this.selectedProducts.reduce((acc, product) => {
      return acc + (product.price * product.quantity);
    }, 0);
    this.totalPrice = this.subtotal;
  }

  onPlaceOrder() {
    if (!this.customerEmail) {
      alert('User email not found. Please log in again.');
      return;
    }

    const orderData = {
      email: this.customerEmail,
      items: this.selectedProducts.map(product => ({
        product_id: product.id,
        quantity: product.quantity
      }))
    };

    this.http.post('http://127.0.0.1:5000/customer_dashboard/place_order', orderData).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert(`Order placed successfully! Total: $${response.total_price}`);
          this.router.navigate(['/client_dashboard']);
        } else {
          alert(response.message);
        }
      },
      error: (error) => {
        alert('Error placing order');
        console.error(error);
      }
    });
  }
}
