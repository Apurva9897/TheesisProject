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
    const customerEmail = sessionStorage.getItem('user_email');
    if (customerEmail) {
      this.http.get<any>(`http://127.0.0.1:5000/customer_dashboard/track_orders?email=${customerEmail}`)
        .subscribe(response => {
          if (response.success) {
            this.orders = response.orders.map((order: any) => ({
              order_id: order.order_id,  // ✅ Use actual ID from backend
              placed_on: new Date(order.placed_on).toLocaleString('en-GB', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }),
              status: order.status,
              items: order.items,
              total: `$${order.total.toFixed(2)}`
            }));
          }
        });
    }
  }
  
}
