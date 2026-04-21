import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredProducts: any[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.productService.getFeatured().subscribe({
      next: (res: any) => (this.featuredProducts = res.data),
      error: (err) => console.error(err),
    });
  }

  addToCart(product: any) {
    if (!this.authService.isAuthenticated()) {
      this.toast.error('Faça login para adicionar ao carrinho.');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.cartService.addItem(product.id).subscribe({
      next: () => this.toast.success(`${product.name} adicionado ao carrinho.`),
      error: (err) => this.toast.error(err.error?.message || 'Não foi possível adicionar.'),
    });
  }
}
