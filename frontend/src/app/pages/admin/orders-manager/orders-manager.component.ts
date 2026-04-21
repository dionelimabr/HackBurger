import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-orders-manager',
  templateUrl: './orders-manager.component.html',
  styleUrls: ['./orders-manager.component.scss'],
})
export class OrdersManagerComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  statuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  constructor(private admin: AdminService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.loading = true;
    this.admin.getAllOrders().subscribe({
      next: (res: any) => { this.orders = res.data; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  changeStatus(order: any, status: string) {
    if (status === order.status) return;
    this.admin.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        order.status = status;
        this.toast.success('Status atualizado.');
      },
      error: (err) => this.toast.error(err.error?.message || 'Falha ao atualizar.'),
    });
  }
}
