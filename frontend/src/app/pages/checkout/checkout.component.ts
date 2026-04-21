import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  form: FormGroup;
  items: any[] = [];
  subtotal = 0;
  deliveryFee = 5.9;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private toast: ToastService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      address_street: ['', Validators.required],
      address_number: ['', Validators.required],
      address_city: ['', Validators.required],
      address_state: ['', [Validators.required, Validators.maxLength(2)]],
      address_zip: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.cartService.getCart().subscribe({
      next: (res: any) => {
        this.items = res.data?.items ?? [];
        this.subtotal = res.data?.total ?? 0;
        if (!this.items.length) {
          this.toast.error('Carrinho vazio.');
          this.router.navigate(['/cart']);
        }
      },
      error: () => this.router.navigate(['/cart']),
    });
  }

  get total() {
    return this.subtotal + this.deliveryFee;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.orderService.checkout(this.form.value).subscribe({
      next: (res: any) => {
        this.toast.success('Pedido confirmado!');
        this.router.navigate(['/orders', res.data.id]);
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error(err.error?.message || 'Falha no checkout.');
      },
    });
  }
}
