import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  form: FormGroup;
  user: any = null;
  orders: any[] = [];
  loading = true;
  uploading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private orderService: OrderService,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: [''],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadOrders();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (res: any) => {
        this.user = res.data;
        this.form.patchValue({ name: this.user.name, phone: this.user.phone ?? '' });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Falha ao carregar perfil.');
      },
    });
  }

  loadOrders() {
    this.orderService.getMyOrders().subscribe({
      next: (res: any) => (this.orders = res.data ?? []),
    });
  }

  avatarUrl(): string {
    if (!this.user?.avatar_url) return 'assets/images/branding/avatar-placeholder.png';
    const url: string = this.user.avatar_url;
    if (url.startsWith('http')) return url;
    const base = environment.apiUrl.replace(/\/api$/, '');
    return `${base}${url}`;
  }

  save() {
    if (this.form.invalid) return;
    this.userService.updateProfile(this.form.value).subscribe({
      next: (res: any) => {
        this.user = res.data;
        this.toast.success('Perfil atualizado.');
      },
      error: () => this.toast.error('Falha ao salvar.'),
    });
  }

  triggerUpload() { this.fileInput.nativeElement.click(); }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.toast.error('Arquivo acima de 2MB.');
      return;
    }
    this.uploading = true;
    this.userService.uploadAvatar(file).subscribe({
      next: (res: any) => {
        this.user = res.data;
        this.uploading = false;
        this.toast.success('Avatar atualizado.');
      },
      error: (err) => {
        this.uploading = false;
        this.toast.error(err.error?.message || 'Falha no upload.');
      },
    });
  }
}
