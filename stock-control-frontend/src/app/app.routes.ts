import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ClientDashboardComponent } from './pages/client-dashboard/client-dashboard.component';
import { ConfirmOrderComponent } from './pages/confirm-order/confirm-order.component';
import { UpdateProfileComponent } from './pages/client-dashboard/update-profile/update-profile.component';
import { TrackOrdersComponent } from './pages/track-orders/track-orders.component';
import { AdminWarehouseZonesComponent } from './pages/admin-warehouse-zones/admin-warehouse-zones.component';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { SupplierOrderComponent } from './pages/supplier-order/supplier-order.component';
import { ReportsComponent } from './pages/reports/reports.component'; 

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, 
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    
     // Admin Dashboard with child routes
  // ADMIN ROUTES PROPERLY
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,  // (Sidebar + Outlet)
    children: [
      { path: '', component: DashboardHomeComponent },  // Default (dashboard cards and graphs)
      { path: 'warehouse-zones', component: AdminWarehouseZonesComponent },
      { path: 'suppliers', component: SupplierOrderComponent },
      {path: 'reports', component: ReportsComponent}, // Placeholder for reports
    ]
  },

    { path: 'client-dashboard', component: ClientDashboardComponent },
    { path: 'confirm-order', component: ConfirmOrderComponent },
    { path: 'update-profile', component: UpdateProfileComponent }, 
    { path: 'track-orders', component: TrackOrdersComponent },
   
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
