import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;

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
  toastRef: any = null;
  addedMessages: string[] = [];
  addedMap = new Map<string, number>();
  selectedOrderDate: string = '';

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    const toastEl = document.getElementById('limitToast');
    if (toastEl) {
      this.toastRef = new bootstrap.Toast(toastEl);
    }
  }

  showToast(message: string) {
    const toastBody = document.getElementById('limitToastBody');
    if (toastBody) toastBody.textContent = message;
    if (this.toastRef) this.toastRef.show();
  }

  onSupplierSelect(): void {
    if (this.selectedSupplier) {
      this.addedMessages = [];
      this.addedMap.clear();
      const apiUrl = `http://127.0.0.1:5000/admin/products_by_supplier_name/${encodeURIComponent(this.selectedSupplier)}`;
      this.http.get<any>(apiUrl, { withCredentials: true }).subscribe({
        next: (response) => {
          if (response.success && response.products) {
            this.products = response.products.map((product: any, index: number) => ({
              ...product,
              item_id: `IT-${product.id}`,
              quantity_to_order: 0,
              shelf: `Shelf ${index + 1}`,
              max_quantity_allowed: this.shelfCapacity - product.stock,
              added_quantity: 0,
              addDisabled: false
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
    const selected = this.products.filter(p => p.added_quantity > 0);
    this.orderSummary.totalItems = selected.length;
    this.orderSummary.totalQuantity = selected.reduce((total, p) => total + p.added_quantity, 0);
  }

  placeOrder(product: any) {
    const remainingCapacity = this.shelfCapacity - product.stock - product.added_quantity;

    if (product.quantity_to_order > remainingCapacity) {
      const message = `❌ Shelf Capacity is ${this.shelfCapacity}. Current stock: ${product.stock}, Already added: ${product.added_quantity}, Max you can add: ${remainingCapacity}`;
      this.showToast(message);
      product.quantity_to_order = 0;
      return;
    }

    // Add to consolidated map
    product.added_quantity += product.quantity_to_order;

    // Update/overwrite message for this product
    this.addedMap.set(product.name, product.added_quantity);
    this.refreshAddedMessages();

    product.quantity_to_order = 0;

    if (product.stock + product.added_quantity >= this.shelfCapacity) {
      product.addDisabled = true;
    }

    this.updateOrderSummary();
  }

  refreshAddedMessages() {
    this.addedMessages = Array.from(this.addedMap.entries()).map(
      ([name, qty]) => `${qty} quantity of ${name} added`
    );
  }

  submitAllOrders() {
    const validOrders = this.products.filter(p => p.added_quantity > 0);
  
    if (validOrders.length === 0) {
      alert('❌ No products added');
      return;
    }
    
    const payload = {
    supplier_name: this.selectedSupplier,
    items: validOrders.map(p => ({
    product_id: p.id,
    product_name: p.name,
    zone: p.zone,
    shelf: p.shelf,
    quantity: p.added_quantity,
    unit_price: p.price
      }))
    };
  
    this.http.post('http://127.0.0.1:5000/admin/submit_supplier_orders', payload, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            alert('✅ Supplier Order Submitted!');
            // Clear selections and messages
            this.products.forEach(p => {
              p.added_quantity = 0;
              p.quantity_to_order = 0;
              p.addDisabled = false;
            });
            this.addedMap.clear();
            this.refreshAddedMessages();
            this.updateOrderSummary();
          } else {
            alert('❌ Submission failed: ' + res.message);
          }
        },
        error: (err) => {
          console.error('❌ API Error:', err);
          alert('❌ Error submitting order');
        }
      });
  }
  
  dismissMessage(index: number) {
    this.addedMessages.splice(index, 1);
  }
}
