import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductsManagerComponent } from './products-manager/products-manager.component';
import { OrdersManagerComponent } from './orders-manager/orders-manager.component';
import { UsersManagerComponent } from './users-manager/users-manager.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductsManagerComponent },
      { path: 'orders', component: OrdersManagerComponent },
      { path: 'users', component: UsersManagerComponent },
    ],
  },
];

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardComponent,
    ProductsManagerComponent,
    OrdersManagerComponent,
    UsersManagerComponent,
  ],
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class AdminModule {}
