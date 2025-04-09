import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-track-orders',
  templateUrl: './track-orders.component.html',
  styleUrls: ['./track-orders.component.css'],
  imports: [CommonModule]
})
export class TrackOrdersComponent implements OnInit {
  orders: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const customerEmail = sessionStorage.getItem('user_email');  // 🛑 Save email during login
    if (customerEmail) {
      this.http.get<any>(`http://127.0.0.1:5000/customer_dashboard/track_orders?email=${customerEmail}`)
        .subscribe(response => {
          if (response.success) {
            this.orders = response.orders;
          }
        });
    }
  }
}
