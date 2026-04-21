import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { OrderService } from '../../core/services/order.service';

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const STATUS_LABEL: Record<string, string> = {
  pending: 'Aguardando confirmação',
  confirmed: 'Confirmado',
  preparing: 'Em preparo',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order: any = null;
  loading = true;
  error = '';
  private sub?: Subscription;
  private pollSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
    this.pollSub = interval(15000).subscribe(() => this.load(id, true));
  }

  load(id: number, silent = false) {
    if (!silent) this.loading = true;
    this.sub = this.orderService.getOrderById(id).subscribe({
      next: (res: any) => {
        this.order = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Pedido não encontrado.';
      },
    });
  }

  statusLabel(s: string) { return STATUS_LABEL[s] ?? s; }

  isDone(step: string): boolean {
    if (!this.order) return false;
    const current = STATUS_ORDER.indexOf(this.order.status);
    const target = STATUS_ORDER.indexOf(step);
    return current >= target && current >= 0;
  }

  get steps() { return STATUS_ORDER.map((s) => ({ key: s, label: STATUS_LABEL[s] })); }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.pollSub?.unsubscribe();
  }
}
