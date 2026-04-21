import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  loading = true;

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.admin.getDashboardStats().subscribe({
      next: (res: any) => {
        this.stats = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
