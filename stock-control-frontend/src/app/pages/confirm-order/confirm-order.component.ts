import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // ✅ Import this
import { Router } from '@angular/router'; // ✅ Import Router
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

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const navigation = history.state;
  
    if (!navigation.email || !navigation.items) {
      console.error("❌ Email or items missing in navigation state");
      return;
    }
  
    this.selectedItems = navigation.items;
  
    this.http.post<any>('http://127.0.0.1:5000/customer_dashboard/confirm_order', {
      email: navigation.email,
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
          image: item.image  // ✅ Already comes like DellXPS15.png
        }));
      }
    });
  }
  

  getImagePath(fileName: string): string {
    if (!fileName) {
      return 'assets/default.png';  // fallback if no image
    }
    return `assets/${fileName}`;
  }
  
  goBack(): void {
    this.router.navigate(['/client-dashboard']);
  }

  updateBasket(): void {
    this.router.navigate(['/client-dashboard']);
  }

  payNow(): void {
    // 🚀 This can be empty for now, or show a success alert
    alert('Payment Successful! Thank you for your purchase.');
  }

}
