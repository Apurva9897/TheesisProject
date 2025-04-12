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


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, 
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'client-dashboard', component: ClientDashboardComponent },
    { path: 'confirm-order', component: ConfirmOrderComponent },
    { path: 'update-profile', component: UpdateProfileComponent }, 
    { path: 'track-orders', component: TrackOrdersComponent },
    { path: 'admin-dashboard/warehouse-zones', component: AdminWarehouseZonesComponent },   
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
