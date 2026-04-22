import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ScoreService } from '../../core/services/score.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  selectedCategory = '';
  searchQuery = '';
  searchHtml: SafeHtml = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private toast: ToastService,
    private scoreService: ScoreService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.route.queryParams.subscribe((p) => {
      this.searchQuery = (p['q'] as string) || '';
      // Intentionally unsanitized render of the search term (CTF: DOM XSS).
      this.searchHtml = this.sanitizer.bypassSecurityTrustHtml(this.searchQuery);

      // Detect XSS payloads and award challenge
      if (/<[a-z][\s\S]*?>/i.test(this.searchQuery)) {
        this.scoreService.tryComplete('domXssChallenge');
      }

      this.loadProducts();
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe((res: any) => {
      this.categories = res.data;
    });
  }

  loadProducts() {
    this.productService.getAll({ category: this.selectedCategory, search: this.searchQuery }).subscribe((res: any) => {
      this.products = res.data;
    });
  }

  filterCategory(slug: string) {
    this.selectedCategory = slug;
    this.loadProducts();
  }

  onAddToCart(product: any) {
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
