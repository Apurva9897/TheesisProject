import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.css'],
  imports: [CommonModule]
})
export class ConfirmOrderComponent implements OnInit {
  selectedItems: any[] = [];
  totalPrice: number = 0;
  email: string = '';
  orderId: string = '';  // Add this if you're storing order ID

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const navigation = history.state;
  
    if (!navigation.email || !navigation.items) {
      console.error("❌ Email or items missing in navigation state");
      return;
    }

    this.email = navigation.email;
    this.selectedItems = navigation.items;

    this.http.post<any>('http://127.0.0.1:5000/customer_dashboard/confirm_order', {
      email: this.email,
      items: this.selectedItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    }).subscribe(response => {
      if (response.success) {
        this.totalPrice = response.total_price;
        this.orderId = response.order_id;  // TEMP ID

        this.selectedItems = response.items.map((item: any) => ({
          ...item,
          subtotal: item.price * item.quantity,
          image: item.image
        }));
      }
    });
  }

  getImagePath(fileName: string): string {
    return fileName ? `assets/${fileName}` : 'assets/default.png';
  }

  goBack(): void {
    this.router.navigate(['/client-dashboard']);
  }

  payNow(): void {
    this.http.post<any>('http://127.0.0.1:5000/customer_dashboard/send_order_receipt', {
      email: this.email,
      order_id: this.orderId,
      total_price: this.totalPrice,
      items: this.selectedItems.map(item => ({
        name: item.name,
        quantity: item.quantity
      }))
    }).subscribe({
      next: (res) => {
        if (res.success) {
          alert("Payment confirmed! Please check your email for receipt.");
        } else {
          alert("Payment confirmed but receipt email failed.");
        }
      },
      error: (err) => {
        console.error("Email failed to send", err);
        alert("Payment confirmed but receipt email failed to send.");
      }
    });
  }
}
