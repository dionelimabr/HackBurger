import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: any;
  loading = true;
  quantity = 1;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      this.loadProduct(slug);
    });
  }

  loadProduct(slug: string) {
    this.loading = true;
    this.productService.getBySlug(slug).subscribe({
      next: (res: any) => {
        this.product = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Produto não encontrado.';
        this.loading = false;
      }
    });
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart() {
    if (!this.authService.isAuthenticated()) {
      this.toast.error('Faça login para adicionar ao carrinho.');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.cartService.addItem(this.product.id, this.quantity).subscribe({
      next: () => this.toast.success('Produto adicionado ao carrinho.'),
      error: (err) => this.toast.error(err.error?.message || 'Não foi possível adicionar.'),
    });
  }
}
