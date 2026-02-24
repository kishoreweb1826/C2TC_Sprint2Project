import { Routes } from '@angular/router';
import { OrderListComponent } from './components/order-list/order-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  {
    path: 'orders',
    component: OrderListComponent,
    title: 'Order Details — OrderFlow'
  },
  { path: '**', redirectTo: 'orders' }
];
