import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supplier-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-order.component.html',
  styleUrls: ['./supplier-order.component.css']
})
export class SupplierOrderComponent {
  suppliers = ['Tech Corp', 'Gadget Hub', 'NextGen Supplies'];
  selectedSupplier: string | null = null;
  products: any[] = [];
  shelfCapacity = 30;
  orderSummary = { totalItems: 0, totalQuantity: 0 };

  constructor(private http: HttpClient) {}

  onSupplierSelect(): void {
    if (this.selectedSupplier) {
      const apiUrl = `http://127.0.0.1:5000/admin/products_by_supplier_name/${encodeURIComponent(this.selectedSupplier)}`;
      this.http.get<any>(apiUrl, { withCredentials: true }).subscribe({
        next: (response) => {
          if (response.success && response.products) {
            this.products = response.products.map((product: any, index: number) => ({
              ...product,
              item_id: `IT-${product.id}`,
              quantity_to_order: 1,
              shelf: `Shelf ${index + 1}`,
              max_quantity_allowed: this.shelfCapacity - product.stock
            }));
            this.updateOrderSummary();
          }
        },
        error: (err) => {
          console.error('❌ Failed to fetch products:', err);
        }
      });
    }
  }

  updateOrderSummary() {
    this.orderSummary.totalItems = this.products.length;
    this.orderSummary.totalQuantity = this.products.reduce((total, p) => total + (p.quantity_to_order || 0), 0);
  }

  placeOrder(product: any) {
    const remainingCapacity = this.shelfCapacity - product.stock;
  
    if (product.quantity_to_order > remainingCapacity) {
      alert(`❌ Cannot add more than ${remainingCapacity} items. Shelf Capacity is 30 and current stock is ${product.stock}.`);
      product.quantity_to_order = remainingCapacity;
    }
  
    this.updateOrderSummary();
  }

  onQuantityChange(product: any) {
    const remainingCapacity = this.shelfCapacity - product.stock;
    if (product.quantity_to_order > remainingCapacity) {
      product.quantity_to_order = remainingCapacity;
      product.limitExceeded = true;
    } else {
      product.limitExceeded = false;
    }
    this.updateOrderSummary();
  }

  submitAllOrders() {
    const validOrders = this.products.filter(p => p.quantity_to_order > 0);
    console.log('📦 Orders Submitted:', validOrders);
    alert('✅ Orders Submitted (Mock)');
  }
}
