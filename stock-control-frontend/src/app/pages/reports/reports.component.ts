import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  activeTab: string = 'supplier';
  supplierOrders: any[] = [];
  suppliers: string[] = ['Tech Corp', 'Gadget Hub', 'NextGen Supplies'];

  filters = {
    supplier: 'All',
    startDate: '',
    endDate: ''
  };

  hasFetched = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  fetchReports() {
    const params: any = {};
    if (this.filters.supplier && this.filters.supplier !== 'All') {
      params.supplier_name = this.filters.supplier;
    }
    if (this.filters.startDate) params.start_date = this.filters.startDate;
    if (this.filters.endDate) params.end_date = this.filters.endDate;

    this.http.get<any>('http://127.0.0.1:5000/admin/get_supplier_order_reports', { params })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.supplierOrders = res.orders;
            this.hasFetched = true;
          }
        },
        error: (err) => {
          console.error('❌ Failed to fetch report:', err);
        }
      });
  }

  exportCSV() {
    if (this.supplierOrders.length === 0) return;

    const header = ['PO Number', 'Supplier', 'Date', 'Products Count', 'Total Cost', 'Status'];
    const rows = this.supplierOrders.map(order => [
      order.order_id,
      order.supplier,
      order.order_date,
      order.products_count,
      `£${order.total_cost.toFixed(2)}`,
      order.status
    ]);

    const csvContent = [header, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'supplier_order_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  clientOrders: any[] = [];
  clientFilters = {
    startDate: '',
    endDate: ''
  };

  fetchClientReports() {
    const params: any = {};
    if (this.clientFilters.startDate) {
      const start = new Date(this.clientFilters.startDate);
      params.start_date = start.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    if (this.clientFilters.endDate) {
      const end = new Date(this.clientFilters.endDate);
      params.end_date = end.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    this.http.get<any>('http://127.0.0.1:5000/admin/get_client_order_reports', { params })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.clientOrders = res.orders;
          }
        },
        error: (err) => {
          console.error('❌ Failed to fetch client orders:', err);
        }
      });
  }

  exportClientCSV() {
    if (this.clientOrders.length === 0) return;

    const header = ['Order ID', 'Customer Email', 'Order Date', 'Products Count', 'Total Amount', 'Status'];
    const rows = this.clientOrders.map(order => [
      order.order_id,
      order.customer_email,
      order.order_date,
      order.products_count,
      `£${order.total_amount.toFixed(2)}`,
      order.status
    ]);

    const csvContent = [header, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'client_order_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
