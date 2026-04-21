import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-products-manager',
  templateUrl: './products-manager.component.html',
  styleUrls: ['./products-manager.component.scss'],
})
export class ProductsManagerComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  loading = true;
  form: FormGroup;
  editingId: number | null = null;
  showForm = false;

  constructor(
    private admin: AdminService,
    private productService: ProductService,
    private fb: FormBuilder,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      category_id: [null, Validators.required],
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      image_url: [''],
      is_available: [1],
      is_featured: [0],
    });
  }

  ngOnInit(): void {
    this.productService.getCategories().subscribe((res: any) => (this.categories = res.data));
    this.load();
  }

  load() {
    this.loading = true;
    this.admin.getAllProducts().subscribe({
      next: (res: any) => {
        this.products = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openCreate() {
    this.editingId = null;
    this.form.reset({ is_available: 1, is_featured: 0, price: 0, category_id: this.categories[0]?.id });
    this.showForm = true;
  }

  openEdit(p: any) {
    this.editingId = p.id;
    this.form.patchValue({
      category_id: p.category_id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      image_url: p.image_url ?? '',
      is_available: p.is_available,
      is_featured: p.is_featured,
    });
    this.showForm = true;
  }

  cancel() {
    this.showForm = false;
    this.editingId = null;
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.value;
    const req$ = this.editingId
      ? this.admin.updateProduct(this.editingId, payload)
      : this.admin.createProduct(payload);

    req$.subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'Produto atualizado.' : 'Produto criado.');
        this.cancel();
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message || 'Falha ao salvar.'),
    });
  }

  delete(p: any) {
    if (!confirm(`Remover "${p.name}"?`)) return;
    this.admin.deleteProduct(p.id).subscribe({
      next: () => {
        this.toast.success('Produto removido.');
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message || 'Falha ao remover.'),
    });
  }
}
