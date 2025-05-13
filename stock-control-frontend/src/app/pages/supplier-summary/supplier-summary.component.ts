import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-supplier-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supplier-summary.component.html',
  styleUrls: ['./supplier-summary.component.css']
})
export class SupplierSummaryComponent {
  supplierName: string = '';
  orderDate: string = '';
  items: any[] = [];
  totalQuantity: number = 0;
  totalItems: number = 0;
  totalCost: number = 0;

  constructor(private router: Router) {
    const navState = this.router.getCurrentNavigation()?.extras?.state;

    if (navState) {
      this.supplierName = navState['supplier_name'];
      this.orderDate = navState['order_date'];
      this.items = navState['items'] || [];
      this.totalQuantity = navState['total_quantity'] || 0;
      this.totalItems = navState['total_items'] || 0;
      this.totalCost = navState['total_cost'] || 0;
    }
  }
}
