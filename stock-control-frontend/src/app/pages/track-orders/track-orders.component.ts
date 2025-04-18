import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-track-orders',
  templateUrl: './track-orders.component.html',
  styleUrls: ['./track-orders.component.css'],
  imports: [CommonModule]
})
export class TrackOrdersComponent implements OnInit {
  orders: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  goHome() {
    this.router.navigate(['/client-dashboard']);
  }

  ngOnInit(): void {
    const customerEmail = sessionStorage.getItem('user_email');  // 🛑 Save email during login
    if (customerEmail) {
      this.http.get<any>(`http://127.0.0.1:5000/customer_dashboard/track_orders?email=${customerEmail}`)
        .subscribe(response => {
          if (response.success) {
            this.orders = response.orders.map((order: any, index: number) => ({
              ...order,
              order_id: `#ORD${100 + index}`,
              placed_on: new Date(order.order_date || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit'
              }),
              items: 1,
              total: '$123.45'
            }));
          }
        });
    }
  }
}
