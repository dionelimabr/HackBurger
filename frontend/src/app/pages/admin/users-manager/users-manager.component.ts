import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-users-manager',
  templateUrl: './users-manager.component.html',
  styleUrls: ['./users-manager.component.scss'],
})
export class UsersManagerComponent implements OnInit {
  users: any[] = [];
  loading = true;

  constructor(private admin: AdminService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.loading = true;
    this.admin.getAllUsers().subscribe({
      next: (res: any) => { this.users = res.data; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  toggle(user: any) {
    const req$ = user.is_active
      ? this.admin.deactivateUser(user.id)
      : this.admin.activateUser(user.id);

    req$.subscribe({
      next: () => {
        user.is_active = user.is_active ? 0 : 1;
        this.toast.success('Usuário atualizado.');
      },
      error: () => this.toast.error('Falha ao atualizar usuário.'),
    });
  }
}
