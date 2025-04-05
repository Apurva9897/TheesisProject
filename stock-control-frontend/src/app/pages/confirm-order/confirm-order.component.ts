import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // ✅ Import this

@Component({
  standalone: true,
  selector: 'app-confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.css'],
  imports: [CommonModule] // ✅ Add this line here
})
export class ConfirmOrderComponent implements OnInit {
  selectedItems: any[] = [];
  totalPrice: number = 0;
  grandTotal: number | undefined;
  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const navigation = history.state;

    if (navigation.items) {
      this.selectedItems = navigation.items;

      this.http.post<any>('http://127.0.0.1:5000/customer_dashboard/confirm_order', {
        email: navigation.email || 'demo@example.com',
        items: this.selectedItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      }).subscribe(response => {
        if (response.success) {
          this.totalPrice = response.total_price;

          this.selectedItems = response.items.map((item: any) => ({
            ...item,
            subtotal: item.price * item.quantity,
            image: item.name.split(' ').join('') + '.png'
          }));
        }
      });
    }
  }

  getImagePath(fileName: string): string {
    if (!fileName) {
      return 'assets/default.png';  // fallback if image not provided
    }
    return `assets/${fileName}`;
  }
}
