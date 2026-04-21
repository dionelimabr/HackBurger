import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  items: any[] = [];
  total = 0;
  loading = true;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.load();
  }

  load() {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (res: any) => {
        this.items = res.data?.items ?? [];
        this.total = res.data?.total ?? 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Não foi possível carregar o carrinho.');
      },
    });
  }

  updateQty(item: any, qty: number) {
    if (qty < 1) return this.remove(item);
    this.cartService.updateItem(item.id, qty).subscribe({
      next: (res: any) => {
        this.items = res.data?.items ?? [];
        this.total = res.data?.total ?? 0;
      },
      error: () => this.toast.error('Falha ao atualizar quantidade.'),
    });
  }

  remove(item: any) {
    this.cartService.removeItem(item.id).subscribe({
      next: (res: any) => {
        this.items = res.data?.items ?? [];
        this.total = res.data?.total ?? 0;
        this.toast.success('Item removido.');
      },
      error: () => this.toast.error('Falha ao remover item.'),
    });
  }

  clear() {
    if (!this.items.length) return;
    this.cartService.clearCart().subscribe({
      next: () => {
        this.items = [];
        this.total = 0;
        this.toast.success('Carrinho limpo.');
      },
    });
  }

  goCheckout() {
    if (!this.items.length) {
      this.toast.error('Carrinho vazio.');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  trackById(_i: number, item: any) {
    return item.id;
  }
}
