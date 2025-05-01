import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css']
})
export class ThankYouComponent {
  items: any[] = [];
  totalPrice: number = 0;
  orderId: string = '';

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;

    if (state) {
      this.items = state['items'] || [];
      this.totalPrice = state['totalPrice'] || 0;
      this.orderId = state['orderId'] || '';
    }
  }

  goToHome() {
    this.router.navigate(['/client-dashboard']);
  }

  logout() {
    // You can also clear sessionStorage or localStorage if used
    this.router.navigate(['/login']);
  }
}
